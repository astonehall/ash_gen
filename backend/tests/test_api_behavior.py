import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app
from backend.app.services.generation import generation_service


class ApiBehaviorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name) / "outputs"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.checkpoints_dir = Path(self.temp_dir.name) / "checkpoints"
        self.checkpoints_dir.mkdir(parents=True, exist_ok=True)

        self.original_enable_stub_generator = settings.enable_stub_generator
        self.original_enable_api_key_auth = settings.enable_api_key_auth
        self.original_api_key = settings.api_key
        self.original_output_dir = settings.output_dir
        self.original_checkpoints_dir = settings.checkpoints_dir
        self.original_model_checkpoint = settings.model_checkpoint
        self.original_service_output_dir = generation_service.output_dir

        settings.output_dir = self.output_dir
        settings.checkpoints_dir = self.checkpoints_dir
        settings.model_checkpoint = None
        settings.enable_stub_generator = True
        settings.enable_api_key_auth = False
        settings.api_key = None
        generation_service.output_dir = self.output_dir

    def tearDown(self) -> None:
        settings.enable_stub_generator = self.original_enable_stub_generator
        settings.enable_api_key_auth = self.original_enable_api_key_auth
        settings.api_key = self.original_api_key
        settings.output_dir = self.original_output_dir
        settings.checkpoints_dir = self.original_checkpoints_dir
        settings.model_checkpoint = self.original_model_checkpoint
        generation_service.output_dir = self.original_service_output_dir
        self.temp_dir.cleanup()

    def test_model_info_resolves_relative_checkpoint_path(self) -> None:
        checkpoint = self.checkpoints_dir / "model.safetensors"
        checkpoint.touch()
        settings.enable_stub_generator = False
        settings.model_checkpoint = checkpoint.name

        response = self.client.get("/v1/model/info")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["used_stub"])
        self.assertEqual(data["resolved_checkpoint_path"], str(checkpoint))
        self.assertTrue(data["checkpoint_exists"])

    def test_model_info_preserves_absolute_checkpoint_path(self) -> None:
        checkpoint = self.checkpoints_dir / "absolute-model.safetensors"
        checkpoint.touch()
        settings.model_checkpoint = str(checkpoint)

        response = self.client.get("/v1/model/info")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["resolved_checkpoint_path"], str(checkpoint))

    def test_protected_route_returns_500_when_auth_enabled_without_api_key(self) -> None:
        settings.enable_api_key_auth = True
        settings.api_key = None

        response = self.client.get("/v1/model/info")

        self.assertEqual(response.status_code, 500)
        self.assertIn("API_KEY is not configured", response.json()["detail"])

    def test_protected_route_returns_401_for_missing_or_invalid_api_key(self) -> None:
        settings.enable_api_key_auth = True
        settings.api_key = "secret-key"

        missing_key_response = self.client.get("/v1/model/info")
        invalid_key_response = self.client.get(
            "/v1/model/info",
            headers={"X-API-Key": "wrong-key"},
        )

        self.assertEqual(missing_key_response.status_code, 401)
        self.assertEqual(invalid_key_response.status_code, 401)

    def test_protected_route_allows_valid_api_key(self) -> None:
        settings.enable_api_key_auth = True
        settings.api_key = "secret-key"

        response = self.client.get(
            "/v1/generate/options",
            headers={"X-API-Key": "secret-key"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["default_sampler"], "euler")

    def test_generate_returns_400_when_checkpoint_is_not_configured(self) -> None:
        settings.enable_stub_generator = False
        settings.model_checkpoint = None

        response = self.client.post(
            "/v1/generate",
            json={"prompt": "checkpoint missing"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("MODEL_CHECKPOINT is required", response.json()["detail"])

    def test_generate_returns_400_when_checkpoint_file_is_missing(self) -> None:
        settings.enable_stub_generator = False
        settings.model_checkpoint = "missing-model.safetensors"

        response = self.client.post(
            "/v1/generate",
            json={"prompt": "missing file"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Model checkpoint not found", response.json()["detail"])

    def test_generate_returns_503_when_runtime_loading_fails(self) -> None:
        checkpoint = self.checkpoints_dir / "model.safetensors"
        checkpoint.touch()
        settings.enable_stub_generator = False
        settings.model_checkpoint = checkpoint.name

        with patch.object(
            generation_service,
            "_get_or_load_pipeline",
            side_effect=RuntimeError("runtime unavailable"),
        ):
            response = self.client.post(
                "/v1/generate",
                json={"prompt": "runtime failure"},
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"], "runtime unavailable")


if __name__ == "__main__":
    unittest.main()