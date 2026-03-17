import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app
from backend.app.services.generation import generation_service


class ApiSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name)
        self.original_enable_stub_generator = settings.enable_stub_generator
        self.original_enable_api_key_auth = settings.enable_api_key_auth
        self.original_api_key = settings.api_key
        self.original_output_dir = settings.output_dir
        self.original_service_output_dir = generation_service.output_dir

        settings.enable_stub_generator = True
        settings.enable_api_key_auth = False
        settings.api_key = None
        settings.output_dir = self.output_dir
        generation_service.output_dir = self.output_dir

    def tearDown(self) -> None:
        settings.enable_stub_generator = self.original_enable_stub_generator
        settings.enable_api_key_auth = self.original_enable_api_key_auth
        settings.api_key = self.original_api_key
        settings.output_dir = self.original_output_dir
        generation_service.output_dir = self.original_service_output_dir
        self.temp_dir.cleanup()

    def test_health_route(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_generation_options_route(self) -> None:
        response = self.client.get("/v1/generate/options")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["default_sampler"], "euler")
        self.assertIn("euler_a", data["samplers"])
        self.assertIn("karras", data["sigma_schedules"])

    def test_model_info_route_in_stub_mode(self) -> None:
        response = self.client.get("/v1/model/info")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["used_stub"])
        self.assertFalse(data["pipeline_loaded"])

    def test_generate_route_creates_stub_artifact(self) -> None:
        response = self.client.post(
            "/v1/generate",
            json={"prompt": "smoke test portrait"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["used_stub"])
        self.assertTrue(data["image_path"].endswith(".txt"))

        target = Path(data["image_path"])
        self.assertTrue(target.exists())
        self.assertIn("smoke test portrait", target.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()