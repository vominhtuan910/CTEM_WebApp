import os
import logging
from typing import Dict, Optional
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)


class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv(
            "GROQ_MODEL", "llama3-8b-8192"
        )  # Default to Llama3 model
        self.client = None

        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info("Groq client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
        else:
            logger.warning("GROQ_API_KEY not found in environment variables")

    def is_available(self) -> bool:
        """Check if Groq service is available"""
        return self.client is not None and self.api_key is not None

    def get_threat_solutions(
        self,
        threat_title: str,
        description: str,
        severity: str,
        cvss_score: float,
        cve_ids: list = None,
    ) -> Dict:
        """
        Get AI-powered solutions for a security threat using Groq API
        """
        if not self.is_available():
            return {
                "success": False,
                "error": "Groq service is not available. Please check your API key configuration.",
            }

        try:
            # Construct a comprehensive prompt for the threat
            prompt = self._build_threat_prompt(
                threat_title, description, severity, cvss_score, cve_ids
            )

            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cybersecurity expert specializing in threat analysis and remediation. Provide clear, actionable solutions for security vulnerabilities.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,  # Lower temperature for more focused responses
                max_tokens=2000,
            )

            # Extract the response content
            ai_solutions = response.choices[0].message.content

            return {
                "success": True,
                "data": {
                    "solutions": ai_solutions,
                    "model_used": f"Groq {self.model}",
                    "tokens_used": response.usage.total_tokens
                    if hasattr(response, "usage")
                    else None,
                },
            }

        except Exception as e:
            logger.error(f"Error getting threat solutions from Groq: {e}")

            # Check if it's a quota or rate limit error
            error_str = str(e)
            if (
                "quota" in error_str.lower()
                or "rate_limit" in error_str.lower()
                or "429" in error_str
            ):
                return {
                    "success": False,
                    "error": f"Groq API quota/rate limit exceeded: {error_str}. Please check your billing and usage limits.",
                    "error_type": "quota_exceeded",
                }

            return {"success": False, "error": f"Failed to get AI solutions: {str(e)}"}

    def _build_threat_prompt(
        self,
        threat_title: str,
        description: str,
        severity: str,
        cvss_score: float,
        cve_ids: list = None,
    ) -> str:
        """Build a comprehensive prompt for threat analysis"""

        prompt = f"""
        Analyze the following security threat and provide detailed, actionable solutions:

        **Threat Details:**
        - Title: {threat_title}
        - Description: {description}
        - Severity: {severity}
        - CVSS Score: {cvss_score}
        """

        if cve_ids:
            prompt += f"- CVE IDs: {', '.join(cve_ids)}\n"

        prompt += """
        
        **Please provide:**
        1. **Risk Assessment**: Evaluate the potential impact and likelihood of exploitation
        2. **Immediate Actions**: What should be done right now to mitigate the threat?
        3. **Remediation Steps**: Detailed steps to fix the vulnerability
        4. **Compensating Controls**: Alternative security measures if direct fixes aren't immediately available
        5. **Best Practices**: Long-term security improvements to prevent similar issues
        6. **Verification**: How to confirm the threat has been properly addressed
        
        Format your response in a clear, structured manner that security teams can easily follow.
        Focus on practical, implementable solutions rather than theoretical advice.
        """

        return prompt

    def get_basic_security_guidance(
        self, threat_title: str, severity: str, cvss_score: float
    ) -> Dict:
        """
        Provide basic security guidance when Groq is not available
        This serves as a fallback for common security scenarios
        """
        try:
            # Basic guidance based on severity and CVSS score
            guidance = {
                "immediate_actions": [],
                "remediation_steps": [],
                "best_practices": [],
                "risk_assessment": "",
            }

            # Immediate actions based on severity
            if severity in ["Critical", "High"]:
                guidance["immediate_actions"] = [
                    "Isolate affected systems from the network immediately",
                    "Assess the scope of potential compromise",
                    "Notify security team and stakeholders",
                    "Document all findings and actions taken",
                ]
            elif severity == "Medium":
                guidance["immediate_actions"] = [
                    "Review affected systems for signs of compromise",
                    "Assess business impact and prioritize remediation",
                    "Plan remediation during next maintenance window",
                ]
            else:
                guidance["immediate_actions"] = [
                    "Document the finding",
                    "Plan remediation during regular maintenance",
                    "Monitor for any changes in threat landscape",
                ]

            # CVSS-based guidance
            if cvss_score >= 9.0:
                guidance["risk_assessment"] = (
                    "CRITICAL: Immediate action required. High risk of exploitation and significant impact."
                )
            elif cvss_score >= 7.0:
                guidance["risk_assessment"] = (
                    "HIGH: Prompt remediation recommended. Moderate to high risk of exploitation."
                )
            elif cvss_score >= 4.0:
                guidance["risk_assessment"] = (
                    "MEDIUM: Remediation should be planned and executed within reasonable timeframe."
                )
            else:
                guidance["risk_assessment"] = (
                    "LOW: Low risk, but should be addressed to maintain security posture."
                )

            # General remediation steps
            guidance["remediation_steps"] = [
                "Apply vendor patches and updates",
                "Implement compensating controls if patches are not available",
                "Verify remediation effectiveness through testing",
                "Update security documentation and procedures",
            ]

            # Best practices
            guidance["best_practices"] = [
                "Maintain regular patch management schedule",
                "Implement network segmentation and access controls",
                "Use vulnerability scanning tools regularly",
                "Establish incident response procedures",
                "Conduct regular security awareness training",
            ]

            return {
                "success": True,
                "data": {
                    "solutions": guidance,
                    "model_used": "Basic Security Guidance (Groq not available)",
                    "note": "This is basic guidance. For detailed AI-powered analysis, please resolve Groq API issues.",
                },
            }

        except Exception as e:
            logger.error(f"Error generating basic security guidance: {e}")
            return {
                "success": False,
                "error": f"Failed to generate basic guidance: {str(e)}",
            }


# Create a singleton instance
groq_service = GroqService()
