# AI-Powered Threat Solutions Integration

This CTEM WebApp now includes OpenAI API integration to provide AI-powered solutions for security threats using ChatGPT.

## Features

- **Individual Threat Analysis**: Get detailed AI-generated solutions for specific vulnerabilities
- **Batch Processing**: Process multiple threats at once for efficiency
- **Comprehensive Solutions**: Includes mitigation steps, remediation strategies, and best practices
- **Real-time AI Responses**: Uses OpenAI's GPT-4 model for accurate cybersecurity guidance

## Setup

### 1. OpenAI API Configuration

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Copy `.env.example` to `.env` in the backend directory
3. Add your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_api_key_here
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for cost optimization
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-4)

## Usage

### Backend API Endpoints

#### Get AI Solutions for a Single Threat
```http
GET /api/findings/ai-solutions/{finding_id}
```

#### Get AI Solutions for Multiple Threats
```http
POST /api/findings/ai-solutions/batch
Content-Type: application/json

{
  "finding_ids": [1, 2, 3]
}
```

#### Check OpenAI Service Status
```http
GET /api/findings/ai-solutions/status
```

### Frontend Integration

The AI Solutions feature is integrated into the Vulnerability Detail dialog:

1. Navigate to the Issues page
2. Click on any vulnerability to open the detail view
3. Click the "Get AI-Powered Solutions" button
4. The AI will analyze the threat and provide comprehensive solutions

## AI Response Format

The AI generates structured responses including:

1. **Threat Analysis**: Brief overview of the security issue
2. **Immediate Mitigation**: Quick steps to reduce risk
3. **Long-term Remediation**: Comprehensive fix strategies
4. **Technical Solutions**: Specific commands, configurations, and patches
5. **Best Practices**: Prevention strategies for similar threats
6. **Risk Assessment**: Prioritization guidance

## Example AI Response

```
1. Threat Analysis
This is a critical SQL injection vulnerability in Drupal core that allows attackers to execute arbitrary SQL commands.

2. Immediate Mitigation
- Disable the affected module if possible
- Implement input validation on all user inputs
- Monitor logs for suspicious database queries

3. Long-term Remediation
- Update to the latest Drupal version
- Apply security patches immediately
- Review and sanitize all database queries

4. Technical Solutions
- Run: composer update drupal/core --with-dependencies
- Add input validation: use prepared statements
- Configure web application firewall rules

5. Best Practices
- Regular security audits
- Input validation on all forms
- Use parameterized queries
- Keep software updated

6. Risk Assessment
This is a HIGH priority fix due to the potential for data breach and system compromise.
```

## Cost Considerations

- **GPT-4**: Higher cost but better accuracy for complex security analysis
- **GPT-3.5-turbo**: Lower cost, suitable for basic threat analysis
- Monitor your OpenAI usage in the [OpenAI Dashboard](https://platform.openai.com/usage)

## Security Notes

- API keys are stored in environment variables (never commit to version control)
- AI responses are generated in real-time and not stored permanently
- All API calls are logged for monitoring and debugging

## Troubleshooting

### Common Issues

1. **"OpenAI service not available"**
   - Check your API key in the `.env` file
   - Verify the API key has sufficient credits
   - Ensure the backend can reach OpenAI's servers

2. **"Failed to get AI solutions"**
   - Check OpenAI service status endpoint
   - Verify network connectivity
   - Check backend logs for detailed error messages

3. **Rate Limiting**
   - OpenAI has rate limits based on your plan
   - Implement retry logic for production use
   - Consider upgrading your OpenAI plan for higher limits

### Debug Mode

Enable debug logging by setting the log level in your backend configuration:

```python
logging.getLogger("openai_service").setLevel(logging.DEBUG)
```

## Future Enhancements

- **Custom Prompts**: Allow security teams to customize AI analysis
- **Solution Templates**: Pre-defined response templates for common threats
- **Integration with Ticketing**: Auto-create remediation tickets from AI analysis
- **Historical Analysis**: Track AI solution effectiveness over time
- **Multi-language Support**: Generate solutions in different languages

## Support

For issues with the AI integration:
1. Check the backend logs for error details
2. Verify OpenAI API key and configuration
3. Test the status endpoint: `/api/findings/ai-solutions/status`
4. Check OpenAI's service status: [status.openai.com](https://status.openai.com)
