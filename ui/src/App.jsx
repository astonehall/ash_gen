import { useEffect, useMemo, useState } from "react";
import { ControlSidebar } from "./components/ControlSidebar";
import { OptionsSidebar } from "./components/OptionsSidebar";
import { TopSettingsBar } from "./components/TopSettingsBar";
import { WorkspaceView } from "./components/WorkspaceView";
import { useApiClient } from "./hooks/useApiClient";
import { useBusyAction } from "./hooks/useBusyAction";
import { usePanelResize } from "./hooks/usePanelResize";
import {
  buildOutputAssetUrl,
  defaultApiBaseUrl,
  defaultPrompt,
  fallbackGenerationOptions,
  getOutputFileName,
} from "./lib/appConfig";

function App() {
  const collapsedRailWidth = 52;
  const [apiBaseUrl, setApiBaseUrl] = useState(defaultApiBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(6.0);
  const [seed, setSeed] = useState("");
  const [sampler, setSampler] = useState("euler");
  const [sigmaSchedule, setSigmaSchedule] = useState("normal");
  const [generationOptions, setGenerationOptions] = useState(
    fallbackGenerationOptions,
  );
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(280);

  const { busy, withBusy } = useBusyAction();
  const { callJson, normalizedApiBaseUrl } = useApiClient(apiBaseUrl, apiKey);
  const { startResize } = usePanelResize({
    leftSidebarWidth,
    rightSidebarWidth,
    setLeftSidebarWidth,
    setRightSidebarWidth,
  });

  const generatedImageUrl = useMemo(
    () => buildOutputAssetUrl(normalizedApiBaseUrl, generation?.image_path),
    [generation, normalizedApiBaseUrl],
  );

  const availableSchedules = useMemo(() => {
    return (
      generationOptions.supported_combinations?.[sampler] ||
      generationOptions.sigma_schedules ||
      fallbackGenerationOptions.sigma_schedules
    );
  }, [generationOptions, sampler]);

  const checkHealth = () =>
    withBusy(async () => {
      const data = await callJson("/health", { method: "GET" });
      setHealth(data);
      setStatusMessage("Health check successful");
    });

  const fetchModelInfo = () =>
    withBusy(async () => {
      const data = await callJson("/v1/model/info", { method: "GET" });
      setModelInfo(data);
      setStatusMessage("Model info loaded");
    });

  const fetchGenerationOptions = async () => {
    try {
      const data = await callJson("/v1/generate/options", { method: "GET" });
      setGenerationOptions(data);
      setSampler(data.default_sampler);
      setSigmaSchedule(data.default_sigma_schedule);
    } catch {
      setGenerationOptions(fallbackGenerationOptions);
      setStatusMessage("Using fallback generation options");
    }
  };

  const generateImage = () =>
    withBusy(async () => {
      const payload = {
        prompt,
        negative_prompt: negativePrompt.trim() || null,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        seed: seed.trim() ? Number(seed) : null,
        sampler,
        sigma_schedule: sigmaSchedule,
      };

      const data = await callJson("/v1/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setGeneration(data);
      setGallery((current) => {
        const previewUrl = buildOutputAssetUrl(
          normalizedApiBaseUrl,
          data.image_path,
        );

        const nextItem = {
          id: data.image_id,
          imageUrl: previewUrl,
          isPreviewable: Boolean(previewUrl),
          fileName: getOutputFileName(data.image_path),
          prompt,
          createdAt: new Date().toLocaleTimeString(),
        };

        return [nextItem, ...current].slice(0, 24);
      });
      setSelectedImageId(data.image_id);
      setStatusMessage("Generation request completed");
    });

  const run = (fn) => async () => {
    try {
      await fn();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Request failed",
      );
    }
  };

  useEffect(() => {
    void fetchGenerationOptions();
  }, []);

  useEffect(() => {
    if (!availableSchedules.includes(sigmaSchedule)) {
      setSigmaSchedule(
        availableSchedules[0] || generationOptions.default_sigma_schedule,
      );
    }
  }, [
    availableSchedules,
    generationOptions.default_sigma_schedule,
    sigmaSchedule,
  ]);

  const selectedGalleryItem = useMemo(() => {
    if (!gallery.length) {
      return null;
    }

    return gallery.find((item) => item.id === selectedImageId) || gallery[0];
  }, [gallery, selectedImageId]);

  const mainPreviewUrl = selectedGalleryItem?.imageUrl || generatedImageUrl;
  const previewMessage =
    selectedGalleryItem && !selectedGalleryItem.isPreviewable
      ? `Selected result is not previewable in the image pane: ${selectedGalleryItem.fileName}`
      : "Live generation previews can slot in here later.";

  return (
    <main className="grid h-screen grid-rows-[auto_minmax(0,1fr)] bg-[#171b21]">
      <TopSettingsBar
        apiBaseUrl={apiBaseUrl}
        apiKey={apiKey}
        busy={busy}
        health={health}
        modelInfo={modelInfo}
        onApiBaseUrlChange={setApiBaseUrl}
        onApiKeyChange={setApiKey}
        onHealthCheck={run(checkHealth)}
        onModelInfo={run(fetchModelInfo)}
        statusMessage={statusMessage}
      />

      <section className="grid min-h-0 grid-cols-[auto_6px_minmax(0,1fr)_6px_auto] max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_minmax(0,1fr)_auto]">
        <ControlSidebar
          availableSchedules={availableSchedules}
          busy={busy}
          collapsedRailWidth={collapsedRailWidth}
          generationOptions={generationOptions}
          guidanceScale={guidanceScale}
          height={height}
          isOpen={leftSidebarOpen}
          onGenerate={run(generateImage)}
          onGuidanceScaleChange={setGuidanceScale}
          onHeightChange={setHeight}
          onResizeStart={startResize("left")}
          onSamplerChange={setSampler}
          onSeedChange={setSeed}
          onSigmaScheduleChange={setSigmaSchedule}
          onStepsChange={setSteps}
          onToggle={() => setLeftSidebarOpen((current) => !current)}
          onWidthChange={setWidth}
          prompt={prompt}
          sampler={sampler}
          seed={seed}
          sigmaSchedule={sigmaSchedule}
          steps={steps}
          width={leftSidebarWidth}
          widthValue={width}
        />

        <WorkspaceView
          gallery={gallery}
          mainPreviewUrl={mainPreviewUrl}
          negativePrompt={negativePrompt}
          onNegativePromptChange={setNegativePrompt}
          onPromptChange={setPrompt}
          onSelectImage={setSelectedImageId}
          previewMessage={previewMessage}
          prompt={prompt}
          selectedGalleryItem={selectedGalleryItem}
        />

        <OptionsSidebar
          collapsedRailWidth={collapsedRailWidth}
          generation={generation}
          health={health}
          isOpen={rightSidebarOpen}
          modelInfo={modelInfo}
          onResizeStart={startResize("right")}
          onToggle={() => setRightSidebarOpen((current) => !current)}
          width={rightSidebarWidth}
        />
      </section>
    </main>
  );
}

export default App;
