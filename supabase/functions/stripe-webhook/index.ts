import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);
    const eventId = event.id;
    const eventType = event.type;

    // Idempotency check: reject duplicate events
    const { data: existing } = await supabase
      .from("stripe_webhooks")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Event already processed", event_id: eventId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the event before processing (prevents re-processing on retry)
    await supabase.from("stripe_webhooks").insert({
      event_id: eventId,
      event_type: eventType,
      payload: event,
      processed: false,
    });

    // Process the event based on type
    let processingError = null;

    try {
      switch (eventType) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          const metadata = paymentIntent.metadata || {};
          const userId = metadata.user_id;
          const enrollmentId = metadata.enrollment_id;

          if (userId && enrollmentId) {
            await supabase
              .from("payments")
              .update({
                status: "completed",
                stripe_payment_intent_id: paymentIntent.id,
                paid_at: new Date().toISOString(),
              })
              .eq("enrollment_id", enrollmentId)
              .eq("user_id", userId);

            await supabase
              .from("course_enrollments")
              .update({ status: "enrolled" })
              .eq("id", enrollmentId);
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          const metadata = paymentIntent.metadata || {};
          const enrollmentId = metadata.enrollment_id;

          if (enrollmentId) {
            await supabase
              .from("payments")
              .update({ status: "failed" })
              .eq("enrollment_id", enrollmentId);
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object;
          const paymentIntentId = charge.payment_intent;

          if (paymentIntentId) {
            await supabase
              .from("payments")
              .update({
                status: "refunded",
                refunded_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntentId);
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      processingError = err instanceof Error ? err.message : String(err);
    }

    // Mark event as processed
    await supabase
      .from("stripe_webhooks")
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    if (processingError) {
      return new Response(
        JSON.stringify({ error: "Processing failed", details: processingError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ received: true, event_id: eventId, type: eventType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
