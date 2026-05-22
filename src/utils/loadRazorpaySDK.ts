export default function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // If already injecting but not yet loaded
    let script = document.getElementById("razorpay-sdk-script") as HTMLScriptElement;
    if (script) {
      script.addEventListener("load", () => resolve(true));
      script.addEventListener("error", () => resolve(false));
      return;
    }

    script = document.createElement("script");
    script.id = "razorpay-sdk-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}