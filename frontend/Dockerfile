FROM mcr.microsoft.com/devcontainers/javascript-node:22-bullseye

# Install basic development tools
RUN apt update && apt install -y sudo

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

