import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { course_id, bundle_id } = await req.json();

    if (!course_id && !bundle_id) {
      return new Response(
        JSON.stringify({ error: "Either course_id or bundle_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = req.headers.get("origin") || "https://wasteinstitute.org";

    if (course_id) {
      // Single course checkout
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, title, price, slug")
        .eq("id", course_id)
        .maybeSingle();

      if (courseError || !course) {
        return new Response(
          JSON.stringify({ error: "Course not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from("course_enrollments")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .maybeSingle();

      if (existing && existing.status === "enrolled") {
        return new Response(
          JSON.stringify({ error: "Already enrolled in this course" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create enrollment record with pending status
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("course_enrollments")
        .upsert({
          user_id: user.id,
          course_id: course_id,
          enrolled_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (enrollmentError) {
        return new Response(
          JSON.stringify({ error: "Failed to create enrollment" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          enrollment_id: enrollment.id,
          user_id: user.id,
          amount: course.price,
          currency: "gbp",
          status: "pending",
          payment_method: "stripe",
        })
        .select()
        .single();

      if (paymentError) {
        return new Response(
          JSON.stringify({ error: "Failed to create payment record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: course.title,
                description: `Online course with certificate | Waste Institute`,
              },
              unit_amount: Math.round(course.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/courses/${course.slug}?payment=success`,
        cancel_url: `${origin}/courses/${course.slug}?payment=cancelled`,
        metadata: {
          user_id: user.id,
          enrollment_id: enrollment.id,
          payment_id: payment.id,
          course_id: course_id,
          type: "course",
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (bundle_id) {
      // Bundle checkout
      const { data: bundle, error: bundleError } = await supabase
        .from("course_bundles")
        .select("id, name, bundle_price, slug")
        .eq("id", bundle_id)
        .maybeSingle();

      if (bundleError || !bundle) {
        return new Response(
          JSON.stringify({ error: "Bundle not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get courses in bundle
      const { data: bundleCourses } = await supabase
        .from("bundle_courses")
        .select("course_id")
        .eq("bundle_id", bundle_id);

      if (!bundleCourses || bundleCourses.length === 0) {
        return new Response(
          JSON.stringify({ error: "Bundle has no courses" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create Stripe Checkout Session for bundle
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: bundle.name,
                description: `Bundle of ${bundleCourses.length} courses | Waste Institute`,
              },
              unit_amount: Math.round(bundle.bundle_price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/courses?payment=success`,
        cancel_url: `${origin}/courses?payment=cancelled`,
        metadata: {
          user_id: user.id,
          bundle_id: bundle_id,
          type: "bundle",
          course_ids: JSON.stringify(bundleCourses.map((bc: { course_id: string }) => bc.course_id)),
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
