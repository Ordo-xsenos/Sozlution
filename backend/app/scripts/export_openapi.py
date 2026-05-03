from pathlib import Path

import yaml

from app.main import app


def main() -> None:
    output_path = Path("openapi.yml")
    schema = app.openapi()
    output_path.write_text(
        yaml.safe_dump(schema, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )
    print(f"OpenAPI schema exported to {output_path}")


if __name__ == "__main__":
    main()
