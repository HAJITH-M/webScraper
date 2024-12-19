# Use an official Node.js image
FROM node:18-slim

# Set environment to non-interactive to avoid unnecessary prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install required system dependencies for Playwright and Python
RUN apt-get update && apt-get install -y \
  wget \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxrandr2 \
  libasound2 \
  libgbm1 \
  libpango-1.0-0 \
  libgdk-pixbuf2.0-0 \
  libnss3-dev \
  libx11-dev \
  python3 \
  python3-pip \
  python3-dev \
  build-essential \
  libpq-dev \
  xz-utils && apt-get clean

# Remove unnecessary man page creation and symbolic link issues
RUN apt-get remove -y xz-utils && apt-get autoremove -y && apt-get clean

# Set the working directory for the application
WORKDIR /app

# Copy the Node.js application files and install Node.js dependencies
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install

# Install Playwright and its dependencies for the Node.js app
RUN npx playwright install --with-deps

# Copy the Node.js application code
COPY backend ./backend/

# Install Python dependencies
COPY BackEndImage/requirements.txt ./BackEndImage/

# Debugging: Check Python and pip versions
RUN echo "Checking Python and pip versions:" && python3 --version && pip3 --version

# Upgrade pip in a more resilient way
RUN python3 -m pip install --upgrade pip

# Check if pip is upgraded successfully
RUN echo "Pip upgraded, checking version again:" && pip3 --version

# Install Python dependencies
RUN pip3 install -r BackEndImage/requirements.txt

# Copy the Python backend code
COPY BackEndImage ./BackEndImage/

# Run Prisma generate for the Node.js app
RUN cd backend && npx prisma generate

# Expose the necessary port
EXPOSE 5000

# Run both Node.js and Python applications together
CMD ["sh", "-c", "cd backend && npm start & python3 BackEndImage/app.py"]
