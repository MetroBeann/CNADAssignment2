# CNADASSIGNMENT2

# Core System Architecture

1. Microservices Architecture:
- User Management Service (Authentication/Authorization)
- Assessment Service (Core assessment logic)
- Results Analysis Service (Risk calculation and recommendations)
- Notification Service (Alerts for high-risk cases)
- Integration Service (For future healthcare system integration)

2. Key Features Priority:
- Simple authentication (using NRIC/special identifier)
- Multi-language support (English/Chinese/Malay/Tamil)
- Voice/Video recording capabilities
- Risk assessment questionnaire
- Results tracking and comparison
- Clinic recommendation system

# Technical Considerations

1. Senior-Centric UI/UX:
- High contrast colors
- Large, readable text
- Voice-guided interface
- Minimal clicks/steps
- Support for multiple languages
- Simple login mechanism

2. Data Management:
- Secure storage of personal information
- Assessment history tracking
- Medical condition records
- Integration capability with healthcare systems
- PDPA compliance for data access

3. Assessment Components:
- CFS 1-9 gate analysis
- MS gate muscle assessment
- Basic movement recording
- Simple questionnaire
- Risk level calculation

# Implementation Phases

Phase 1:
- Core assessment functionality
- Basic authentication
- Single language (English)
- Essential UI/UX features

Phase 2:
- Additional languages
- Voice/Video support
- Healthcare provider integration
- Advanced analytics

Phase 3:
- ML-based risk assessment
- Automated clinic recommendations
- Community support features
- Mobile app development

# Microservices Distribution (5-person team):

1. Authentication & User Management:
- Handle user registration/login
- Manage access rights
- PDPA compliance

2. Assessment Engine:
- Questionnaire management
- Video/voice recording
- Movement analysis

3. Results & Analytics:
- Risk calculation
- Historical comparison
- Generate insights

4. Notification & Recommendations:
- Alert system for high risk
- Clinic recommendations
- Family/doctor notifications

5. Integration & Support:
- Healthcare system integration
- Multi-language support
- Technical support features

# Overall System Architecture
![Image](https://github.com/user-attachments/assets/7111fef7-8cb8-42d3-b853-9f00a90f0ac4)

# Step 1: Development Environment Setup
1. Install Node.js and npm (Node Package Manager)
   ```bash
   # Download and install from nodejs.org
   # Verify installation
   node --version
   npm --version
   ```

2. Install Docker and Docker Compose
   ```bash
   # Download and install Docker Desktop from docker.com
   # Verify installation
   docker --version
   docker-compose --version
   ```

# Step 2: Project Structure Setup
```plaintext
CNADASSIGNMENT2/
├── api-gateway/
│   ├── app.js
│   ├── node_modules/
│   ├── Dockerfile
│   ├── package-lock.json
│   └── package.json
├── node_modules/
├── frontend/
│   └── index.html
│   └── assessment.html
│   └── notification.html
│   └── user.html
│   └── analytics.html
├── services/
│   ├── analytics/
│   │   ├── app.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── assessment/
│   │   ├── app.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── notification/
│   │   ├── app.js
│   │   ├── Dockerfile
│   │   └── package.json
│   └── user/
│       ├── app.js
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yaml
├── package-lock.json
├── package.json
└── README.md
```

# Step 3: Initialize Each Service
For each service (including api-gateway), run:
```bash
cd service-folder
npm init -y
npm install express cors dotenv express-http-proxy axios
```

# Step 4: Basic API Gateway Setup
```javascript
// api-gateway/server.js
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());
app.use(express.json());

// Route to services
app.use('/assessment', proxy('http://assessment:3001'));
app.use('/user', proxy('http://user:3002'));
app.use('/notification', proxy('http://notification:3003'));
app.use('/analytics', proxy('http://analytics:3004'));

app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});
```

# Step 5: Docker Configuration
1. Create Dockerfile for each service:
```dockerfile
# services/*/Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE [PORT]
CMD ["node", "server.js"]
```

2. Create docker-compose.yml:
```yaml
version: '3'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    networks:
      - app-network

  assessment:
    build: ./services/assessment
    ports:
      - "3001:3001"
    networks:
      - app-network

  user:
    build: ./services/user
    ports:
      - "3002:3002"
    networks:
      - app-network

  notification:
    build: ./services/notification
    ports:
      - "3003:3003"
    networks:
      - app-network

  analytics:
    build: ./services/analytics
    ports:
      - "3004:3004"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

# Step 6: Frontend Setup
1. Create basic HTML structure:
```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Fall Risk Assessment</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Your content here -->
    <script src="js/main.js"></script>
</body>
</html>
```

# Step 7: Running the Application
1. Build and run containers:
```bash
docker-compose build
docker-compose up
```

# Development Workflow:
1. Start with local development:
   - Run services individually using `node server.js`
   - Test API endpoints using Postman/curl
   - Develop frontend separately

2. Once individual components work:
   - Build Docker images
   - Test containerized services
   - Test complete system

# Next Steps:
1. Choose and set up your database
2. Implement service-specific logic
3. Add authentication/authorization
4. Develop frontend features
5. Add error handling and logging
6. Implement monitoring

# Development Tips:
- Use nodemon for development
- Implement health checks
- Use environment variables
- Set up proper logging
- Implement error handling middleware
- Use swagger for API documentation

# Verify installation
node --version
npm --version
docker --version
docker-compose --version

# How to build (api-gateway & all services)
1) Install Packages: npm install express cors dotenv express-http-proxy
2) Build Container: docker-compose build
3) In api-gateway: npm install express cors dotenv express-http-proxy --save

# How to run (api-gateway & all services)
1) Individual Services: node app.js
2) Run Container: docker-compose up




api-gateway : 8000
analytics : 8004
assessment: 8001
notification: 8003
user : 8002