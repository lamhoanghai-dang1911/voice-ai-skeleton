import logging
import sys
from app.config import settings


def setup_logger(name: str = "ix-voice") -> logging.Logger:
    logger = logging.getLogger(name)
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(log_level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] [%(filename)s:%(lineno)d]: %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logger()
