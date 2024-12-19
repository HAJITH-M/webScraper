# Use an official Node.js image
FROM node:18-slim

# Install required system dependencies for Playwright
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
  && apt-get clean

# Set the working directory for the application
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install Playwright and its dependencies
RUN npx playwright install --with-deps

# Copy the rest of the app's code
COPY . .

# Expose the necessary port
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
