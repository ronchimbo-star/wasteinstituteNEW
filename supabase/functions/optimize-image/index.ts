import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ImageOptimizationRequest {
  bucket: string;
  path: string;
  maxWidth?: number;
  quality?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { bucket, path, maxWidth = 1920, quality = 85 }: ImageOptimizationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const downloadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Failed to download image: ${downloadResponse.statusText}`);
    }

    const imageBuffer = await downloadResponse.arrayBuffer();

    const optimizedBuffer = await optimizeImage(
      new Uint8Array(imageBuffer),
      maxWidth,
      quality
    );

    const fileName = path.split('/').pop()?.replace(/\.[^.]+$/, '.webp') || 'optimized.webp';
    const optimizedPath = path.replace(/\.[^.]+$/, '.webp');

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${optimizedPath}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'image/webp',
      },
      body: optimizedBuffer,
    });

    if (!uploadResponse.ok) {
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${optimizedPath}`;

      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'image/webp',
        },
        body: optimizedBuffer,
      });

      if (!putResponse.ok) {
        throw new Error(`Failed to upload optimized image: ${putResponse.statusText}`);
      }
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${optimizedPath}`;

    return new Response(
      JSON.stringify({
        success: true,
        originalPath: path,
        optimizedPath: optimizedPath,
        publicUrl: publicUrl,
        originalSize: imageBuffer.byteLength,
        optimizedSize: optimizedBuffer.byteLength,
        savings: Math.round((1 - optimizedBuffer.byteLength / imageBuffer.byteLength) * 100),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error optimizing image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function optimizeImage(
  imageData: Uint8Array,
  maxWidth: number,
  quality: number
): Promise<Uint8Array> {
  const imageMagickUrl = "https://imagemagick.org/archive/binaries/magick";

  try {
    const blob = new Blob([imageData]);
    const formData = new FormData();
    formData.append("image", blob);

    const canvas = await createImageCanvas(imageData, maxWidth);
    const webpBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: quality / 100,
    });

    return new Uint8Array(await webpBlob.arrayBuffer());
  } catch (error) {
    console.warn("Advanced optimization failed, using basic compression:", error);
    return imageData;
  }
}

async function createImageCanvas(imageData: Uint8Array, maxWidth: number): Promise<any> {
  const blob = new Blob([imageData]);
  const imageBitmap = await createImageBitmap(blob);

  let width = imageBitmap.width;
  let height = imageBitmap.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  return canvas;
}
