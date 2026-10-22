import os
import pytest

# Ensure tests run in test environment and bypass Celery Redis connection
os.environ["ENVIRONMENT"] = "test"
os.environ["DISABLE_CELERY"] = "1"
os.environ["PIPELINE_MODE"] = "mock"
