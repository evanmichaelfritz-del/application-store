/**
 * Open-source Craft apps. Static facts, refreshed by hand.
 * Names, descriptions, NOTICE text, release tags, dates, and download URLs
 * come from the storytold GitHub repos. Nothing here is a hosted build.
 */
export const CRAFT_CATEGORY_SLUG = 'apps';
export const CRAFT_CATEGORY_LABEL = 'Open-source apps';
export const CRAFT_LICENSE = 'Dual MIT / Apache-2.0';
export const EARLY_ALPHA = 'early-alpha';
export const CLI_UNDOCUMENTED = 'CLI available, commands not yet documented here';

/** FilmCraft repo root `.mcp.json`, the only confirmed bot-control config. */
export const FILMCRAFT_MCP = "{\n  \"mcpServers\": {\n    \"filmcraft\": {\n      \"command\": \"target/release/filmcraft-cli\",\n      \"args\": [\"mcp\", \"--bridge\", \"127.0.0.1:9876\"]\n    },\n    \"filmcraft-headless\": {\n      \"command\": \"target/release/filmcraft-cli\",\n      \"args\": [\"mcp\", \"--demo\"]\n    }\n  }\n}";

export const CRAFT_APPS = [
  {
    slug: "art-craft",
    title: "ArtCraft",
    description: "ArtCraft is an intentional crafting engine for artists, designers, and filmmakers",
    repoUrl: "https://github.com/storytold/artcraft",
    releaseTag: "artcraft-v0.41.0",
    releaseUrl: "https://github.com/storytold/artcraft/releases/tag/artcraft-v0.41.0",
    publishedOn: "Sep 26, 2026",
    notice: "ArtCraft\nCopyright (c) 2026 ArtCraft Team and the ArtCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos are trademarks of the ArtCraft Team. They are not covered\nby the license above.",
    downloads: [
      {
        name: "ArtCraft_0.41.0_universal.dmg",
        url: "https://github.com/storytold/artcraft/releases/download/artcraft-v0.41.0/ArtCraft_0.41.0_universal.dmg",
        kind: "desktop"
      },
      {
        name: "ArtCraft_0.41.0_x64-setup.exe",
        url: "https://github.com/storytold/artcraft/releases/download/artcraft-v0.41.0/ArtCraft_0.41.0_x64-setup.exe",
        kind: "desktop"
      },
      {
        name: "ArtCraft_0.41.0_x64_en-US.msi",
        url: "https://github.com/storytold/artcraft/releases/download/artcraft-v0.41.0/ArtCraft_0.41.0_x64_en-US.msi",
        kind: "desktop"
      },
      {
        name: "ArtCraft_universal.app.tar.gz",
        url: "https://github.com/storytold/artcraft/releases/download/artcraft-v0.41.0/ArtCraft_universal.app.tar.gz",
        kind: "desktop"
      }
    ],
    bot: "none"
  },
  {
    slug: "photo-craft",
    title: "PhotoCraft",
    description: "PhotoCraft: An open-source, photo editor written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/photocraft",
    releaseTag: "v0.9.0",
    releaseUrl: "https://github.com/storytold/photocraft/releases/tag/v0.9.0",
    publishedOn: "Oct 14, 2026",
    notice: "PhotoCraft\nCopyright (c) 2026 ArtCraft Team and the PhotoCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "photocraft-0.9.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-aarch64.deb",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-riscv64.deb",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-x86_64.deb",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-macos-universal.dmg",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-arm64.msi",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-x64.msi",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "photocraft-0.9.0-windows-x86.msi",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-0.9.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "photocraft-cli-0.9.0-macos-universal.zip",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-cli-0.9.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "photocraft-web-0.9.0.zip",
        url: "https://github.com/storytold/photocraft/releases/download/v0.9.0/photocraft-web-0.9.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "vector-craft",
    title: "VectorCraft",
    description: "VectorCraft: An open-source, vector art tool written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/vectorcraft",
    releaseTag: "v0.11.0",
    releaseUrl: "https://github.com/storytold/vectorcraft/releases/tag/v0.11.0",
    publishedOn: "Oct 14, 2026",
    notice: "VectorCraft\nCopyright (c) 2026 ArtCraft Team and the VectorCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "vectorcraft-0.11.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-aarch64.deb",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-x86_64.deb",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-macos-universal.dmg",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-arm64.msi",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-x64.msi",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "vectorcraft-0.11.0-windows-x86.msi",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-0.11.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "vectorcraft-cli-0.11.0-macos-universal.zip",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-cli-0.11.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "vectorcraft-web-0.11.0.zip",
        url: "https://github.com/storytold/vectorcraft/releases/download/v0.11.0/vectorcraft-web-0.11.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "film-craft",
    title: "FilmCraft",
    description: "FilmCraft: An open-source, nonlinear video editor written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/filmcraft",
    releaseTag: "v0.8.0",
    releaseUrl: "https://github.com/storytold/filmcraft/releases/tag/v0.8.0",
    publishedOn: "Oct 14, 2026",
    notice: "FilmCraft\nCopyright (c) 2026 ArtCraft Team and the FilmCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "filmcraft-0.8.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-aarch64.deb",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-riscv64.deb",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-x86_64.deb",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-macos-universal.dmg",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-arm64.msi",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-x64.msi",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "filmcraft-0.8.0-windows-x86.msi",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-0.8.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "filmcraft-cli-0.8.0-macos-universal.zip",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-cli-0.8.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "filmcraft-web-0.8.0.zip",
        url: "https://github.com/storytold/filmcraft/releases/download/v0.8.0/filmcraft-web-0.8.0.zip",
        kind: "web"
      }
    ],
    bot: "mcp"
  },
  {
    slug: "light-craft",
    title: "LightCraft",
    description: "LightCraft: An open-source non-destructive photo editor written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/lightcraft",
    releaseTag: "v0.8.0",
    releaseUrl: "https://github.com/storytold/lightcraft/releases/tag/v0.8.0",
    publishedOn: "Oct 14, 2026",
    notice: "LightCraft\nCopyright (c) 2026 ArtCraft Team and the LightCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "lightcraft-0.8.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-aarch64.deb",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-x86_64.deb",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-macos-universal.dmg",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-arm64.msi",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-x64.msi",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "lightcraft-0.8.0-windows-x86.msi",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-0.8.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "lightcraft-cli-0.8.0-macos-universal.zip",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-cli-0.8.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "lightcraft-web-0.8.0.zip",
        url: "https://github.com/storytold/lightcraft/releases/download/v0.8.0/lightcraft-web-0.8.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "pdf-craft",
    title: "PdfCraft",
    description: "PdfCraft: An open-source PDF reader and editor written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/pdfcraft",
    releaseTag: "v0.8.0",
    releaseUrl: "https://github.com/storytold/pdfcraft/releases/tag/v0.8.0",
    publishedOn: "Oct 14, 2026",
    notice: "PdfCraft\nCopyright (c) 2026 ArtCraft Team and the PdfCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "pdfcraft-0.8.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-aarch64.deb",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-riscv64.deb",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-x86_64.deb",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-macos-universal.dmg",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-arm64.msi",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-x64.msi",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "pdfcraft-0.8.0-windows-x86.msi",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-0.8.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "pdfcraft-cli-0.8.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-cli-0.8.0-linux-aarch64.tar.gz",
        kind: "cli"
      },
      {
        name: "pdfcraft-cli-0.8.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-cli-0.8.0-linux-x86_64.tar.gz",
        kind: "cli"
      },
      {
        name: "pdfcraft-cli-0.8.0-macos-universal.zip",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-cli-0.8.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "pdfcraft-web-0.8.0.zip",
        url: "https://github.com/storytold/pdfcraft/releases/download/v0.8.0/pdfcraft-web-0.8.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "effect-craft",
    title: "EffectCraft",
    description: "EffectCraft: An open-source motion graphics and compositing tool written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/effectcraft",
    releaseTag: "v0.10.0",
    releaseUrl: "https://github.com/storytold/effectcraft/releases/tag/v0.10.0",
    publishedOn: "Oct 14, 2026",
    notice: "EffectCraft\nCopyright (c) 2026 ArtCraft Team and the EffectCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "effectcraft-0.10.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-aarch64.deb",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-riscv64.deb",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-x86_64.deb",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-macos-universal.dmg",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-arm64.msi",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-x64.msi",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "effectcraft-0.10.0-windows-x86.msi",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-0.10.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "effectcraft-cli-0.10.0-macos-universal.zip",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-cli-0.10.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "effectcraft-web-0.10.0.zip",
        url: "https://github.com/storytold/effectcraft/releases/download/v0.10.0/effectcraft-web-0.10.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "design-craft",
    title: "DesignCraft",
    description: "DesignCraft: An open-source page and layout design editor written by scratch in pure Rust",
    repoUrl: "https://github.com/storytold/designcraft",
    releaseTag: "v0.8.0",
    releaseUrl: "https://github.com/storytold/designcraft/releases/tag/v0.8.0",
    publishedOn: "Oct 14, 2026",
    notice: "DesignCraft\nCopyright (c) 2026 ArtCraft Team and the DesignCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "designcraft-0.8.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-aarch64.deb",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-riscv64.deb",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-x86_64.deb",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-macos-universal.dmg",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-arm64.msi",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-x64.msi",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "designcraft-0.8.0-windows-x86.msi",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-0.8.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "designcraft-cli-0.8.0-macos-universal.zip",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-cli-0.8.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "designcraft-web-0.8.0.zip",
        url: "https://github.com/storytold/designcraft/releases/download/v0.8.0/designcraft-web-0.8.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "word-craft",
    title: "WordCraft",
    description: "An open-source, clean-room reimplementation of Microsoft Word in pure Rust",
    repoUrl: "https://github.com/storytold/wordcraft",
    releaseTag: "v0.7.0",
    releaseUrl: "https://github.com/storytold/wordcraft/releases/tag/v0.7.0",
    publishedOn: "Oct 14, 2026",
    notice: "WordCraft\nCopyright (c) 2026 ArtCraft Team and the WordCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "wordcraft-0.7.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-aarch64.deb",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-riscv64.deb",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-x86_64.deb",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-macos-universal.dmg",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-arm64.msi",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-x64.msi",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "wordcraft-0.7.0-windows-x86.msi",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-0.7.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "wordcraft-cli-0.7.0-macos-universal.zip",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-cli-0.7.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "wordcraft-web-0.7.0.zip",
        url: "https://github.com/storytold/wordcraft/releases/download/v0.7.0/wordcraft-web-0.7.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "grid-craft",
    title: "GridCraft",
    description: "GridCraft: an open-source, clean-room spreadsheet (Microsoft Excel-style) in pure Rust. By ArtCraft.",
    repoUrl: "https://github.com/storytold/gridcraft",
    releaseTag: "v0.7.0",
    releaseUrl: "https://github.com/storytold/gridcraft/releases/tag/v0.7.0",
    publishedOn: "Oct 14, 2026",
    notice: "GridCraft\nCopyright (c) 2026 ArtCraft Team and the GridCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "gridcraft-0.7.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-aarch64.deb",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-riscv64.deb",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-x86_64.deb",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-macos-universal.dmg",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-arm64.msi",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-x64.msi",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "gridcraft-0.7.0-windows-x86.msi",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-0.7.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "gridcraft-cli-0.7.0-macos-universal.zip",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-cli-0.7.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "gridcraft-web-0.7.0.zip",
        url: "https://github.com/storytold/gridcraft/releases/download/v0.7.0/gridcraft-web-0.7.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "deck-craft",
    title: "DeckCraft",
    description: "Presentations and slide shows: an open-source, clean-room reimplementation of Microsoft PowerPoint in pure Rust. Part of the ArtCraft Crafting Apps.",
    repoUrl: "https://github.com/storytold/deckcraft",
    releaseTag: "v0.7.0",
    releaseUrl: "https://github.com/storytold/deckcraft/releases/tag/v0.7.0",
    publishedOn: "Oct 14, 2026",
    notice: "DeckCraft\nCopyright (c) 2026 ArtCraft Team and the DeckCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "deckcraft-0.7.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-aarch64.deb",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-riscv64.deb",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-x86_64.deb",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-macos-universal.dmg",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-arm64.msi",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-x64.msi",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "deckcraft-0.7.0-windows-x86.msi",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-0.7.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "deckcraft-cli-0.7.0-macos-universal.zip",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-cli-0.7.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "deckcraft-web-0.7.0.zip",
        url: "https://github.com/storytold/deckcraft/releases/download/v0.7.0/deckcraft-web-0.7.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "cad-craft",
    title: "CADCraft",
    description: "CADCraft: computer-aided design and drafting — an open-source, clean-room AutoCAD-style app in pure Rust",
    repoUrl: "https://github.com/storytold/cadcraft",
    releaseTag: "v0.7.0",
    releaseUrl: "https://github.com/storytold/cadcraft/releases/tag/v0.7.0",
    publishedOn: "Oct 14, 2026",
    notice: "CADCraft\nCopyright (c) 2026 ArtCraft Team and the CADCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "cadcraft-0.7.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-aarch64.deb",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-riscv64.deb",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-x86_64.deb",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-macos-universal.dmg",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-arm64.msi",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-x64.msi",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "cadcraft-0.7.0-windows-x86.msi",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-0.7.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "cadcraft-cli-0.7.0-macos-universal.zip",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-cli-0.7.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "cadcraft-web-0.7.0.zip",
        url: "https://github.com/storytold/cadcraft/releases/download/v0.7.0/cadcraft-web-0.7.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "sound-craft",
    title: "SoundCraft",
    description: "An open-source, clean-room reimplementation of Avid Pro Tools in pure Rust",
    repoUrl: "https://github.com/storytold/soundcraft",
    releaseTag: "v0.7.0",
    releaseUrl: "https://github.com/storytold/soundcraft/releases/tag/v0.7.0",
    publishedOn: "Oct 14, 2026",
    notice: "SoundCraft\nCopyright (c) 2026 ArtCraft Team and the SoundCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "soundcraft-0.7.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-aarch64.deb",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-riscv64.deb",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-riscv64.rpm",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-x86_64.deb",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-macos-universal.dmg",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-arm64.msi",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-x64.msi",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "soundcraft-0.7.0-windows-x86.msi",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-0.7.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "soundcraft-cli-0.7.0-macos-universal.zip",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-cli-0.7.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "soundcraft-web-0.7.0.zip",
        url: "https://github.com/storytold/soundcraft/releases/download/v0.7.0/soundcraft-web-0.7.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "fig-craft",
    title: "FigCraft",
    description: "FigCraft: interface design and prototyping; an open-source, clean-room reimplementation of collaborative design workflows in pure Rust",
    repoUrl: "https://github.com/storytold/figcraft",
    releaseTag: "v0.6.0",
    releaseUrl: "https://github.com/storytold/figcraft/releases/tag/v0.6.0",
    publishedOn: "Oct 14, 2026",
    notice: "FigCraft\nCopyright (c) 2026 ArtCraft Team and the FigCraft contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark and logos in docs/brand/ are trademarks of the ArtCraft Team. They are\nnot open source and are not covered by the license above; their terms are in\ndocs/brand/LICENSE-brand.txt.",
    downloads: [
      {
        name: "figcraft-0.6.0-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-aarch64.AppImage",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-aarch64.deb",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-aarch64.flatpak",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-aarch64.rpm",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-x86_64.AppImage",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-x86_64.deb",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-x86_64.flatpak",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-x86_64.rpm",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-macos-universal.dmg",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-arm64-portable.zip",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-arm64.msi",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-x64-portable.zip",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-x64.msi",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-x86-portable.zip",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "figcraft-0.6.0-windows-x86.msi",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-0.6.0-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "figcraft-cli-0.6.0-macos-universal.zip",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-cli-0.6.0-macos-universal.zip",
        kind: "cli"
      },
      {
        name: "figcraft-server-0.6.0-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-server-0.6.0-linux-aarch64.tar.gz",
        kind: "server"
      },
      {
        name: "figcraft-server-0.6.0-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-server-0.6.0-linux-x86_64.tar.gz",
        kind: "server"
      },
      {
        name: "figcraft-web-0.6.0.zip",
        url: "https://github.com/storytold/figcraft/releases/download/v0.6.0/figcraft-web-0.6.0.zip",
        kind: "web"
      }
    ],
    bot: "cli"
  },
  {
    slug: "craft-launcher",
    title: "ArtCraft Launcher",
    description: "The Craft App Launcher",
    repoUrl: "https://github.com/storytold/craft-launcher",
    releaseTag: "v0.4.1",
    releaseUrl: "https://github.com/storytold/craft-launcher/releases/tag/v0.4.1",
    publishedOn: "Oct 13, 2026",
    notice: "ArtCraft Launcher\nCopyright (c) 2026 ArtCraft Team and the ArtCraft Launcher contributors.\nLicensed under the MIT License or the Apache License, Version 2.0, at your option\n(LICENSE-MIT, LICENSE-APACHE).\n\nThe ArtCraft name, wordmark, logo and \"A\" mark (docs/brand/) are trademarks of the ArtCraft Team.\nThey are NOT open source and are NOT covered by the MIT or Apache-2.0 license above. This includes\neverywhere ArtCraft Launcher shows them: the app icon (assets/app-icon/, the blue \"A\" mark), the\nArtCraft logo in the window header and the \"A\" mark used as the tray / menu-bar icon\n(docs/brand/artcraft-mark-64.png, artcraft-mark-black-44.png).\nTheir terms are in docs/brand/LICENSE-brand.txt; forks and modified versions must remove them.",
    downloads: [
      {
        name: "artcraft-launcher-0.4.1-freebsd-x86_64.tar.gz",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-freebsd-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-aarch64.AppImage",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-aarch64.AppImage",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-aarch64.deb",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-aarch64.deb",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-aarch64.flatpak",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-aarch64.flatpak",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-aarch64.rpm",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-aarch64.rpm",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-aarch64.tar.gz",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-aarch64.tar.gz",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-riscv64.deb",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-riscv64.deb",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-riscv64.rpm",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-riscv64.rpm",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-riscv64.tar.gz",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-riscv64.tar.gz",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-x86_64.AppImage",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-x86_64.AppImage",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-x86_64.deb",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-x86_64.deb",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-x86_64.flatpak",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-x86_64.flatpak",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-x86_64.rpm",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-x86_64.rpm",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-linux-x86_64.tar.gz",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-linux-x86_64.tar.gz",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-macos-universal.dmg",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-macos-universal.dmg",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-arm64-portable.zip",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-arm64-portable.zip",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-arm64.msi",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-arm64.msi",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-x64-portable.zip",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-x64-portable.zip",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-x64.msi",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-x64.msi",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-x86-portable.zip",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-x86-portable.zip",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-0.4.1-windows-x86.msi",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-0.4.1-windows-x86.msi",
        kind: "desktop"
      },
      {
        name: "artcraft-launcher-web-0.4.1.zip",
        url: "https://github.com/storytold/craft-launcher/releases/download/v0.4.1/artcraft-launcher-web-0.4.1.zip",
        kind: "web"
      }
    ],
    bot: "none"
  }
] as const;

export type CraftApp = (typeof CRAFT_APPS)[number];
export type CraftDownload = CraftApp['downloads'][number];

export function craftBySlug(slug: string) {
  for (const app of CRAFT_APPS) {
    if (app.slug === slug) return app;
  }
  return null;
}

export function isCraftSlug(slug: string): boolean {
  return craftBySlug(slug) !== null;
}

export function downloadsOf(app: CraftApp, kind: CraftDownload['kind']) {
  return app.downloads.filter((item) => item.kind === kind);
}
