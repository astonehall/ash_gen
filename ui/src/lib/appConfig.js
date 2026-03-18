export const defaultApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const defaultPrompt = "portrait photo, soft lighting";

export const fallbackGenerationOptions = {
  samplers: ["euler", "euler_a", "dpmpp_2m"],
  sigma_schedules: ["normal", "karras"],
  default_sampler: "euler",
  default_sigma_schedule: "normal",
  supported_combinations: {
    euler: ["normal", "karras"],
    euler_a: ["normal", "karras"],
    dpmpp_2m: ["normal", "karras"],
  },
};

export const formatOptionLabel = (value) => {
  if (value === "euler_a") {
    return "Euler A";
  }

  if (value === "dpmpp_2m") {
    return "DPM++ 2M";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const normalizeApiBaseUrl = (value) => value.trim().replace(/\/+$/, "");

export const getOutputFileName = (path) => {
  if (!path) {
    return "";
  }

  return path.split(/[\\/]/).pop() || "";
};

export const isPreviewableImage = (path) =>
  /\.(png|jpg|jpeg|webp)$/i.test(getOutputFileName(path));

export const buildOutputAssetUrl = (apiBaseUrl, path) => {
  const fileName = getOutputFileName(path);

  if (!fileName || !isPreviewableImage(fileName)) {
    return null;
  }

  return `${normalizeApiBaseUrl(apiBaseUrl)}/outputs/${encodeURIComponent(fileName)}`;
};
