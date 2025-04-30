import React from 'react'
import styles from './Faq.module.css'

export default function Faq() {
  return (
    <div className={styles.faqWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Interview Preparation FAQ</h1>
          <p>Get answers to the most common questions about interview preparation, techniques, and strategies to help you land your dream job.</p>
        </div>

        <div className={styles["faq-container"]}>
          <div className={`${styles.orb} ${styles["orb-1"]}`}></div>
          <div className={`${styles.orb} ${styles["orb-2"]}`}></div>

          {/* FAQ Item 1 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                How should I prepare for a technical interview?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>Start by <span className={styles.highlight}>understanding the fundamentals</span> of data structures and algorithms. Practice coding problems regularly on platforms like LeetCode or HackerRank. Review the job description to understand what technologies you need to focus on.</p>
                <br />
                <p>Create a study plan that includes:</p>
                <ul style={{marginLeft: "20px", marginTop: "10px"}}>
                  <li>Reviewing core CS concepts</li>
                  <li>Practicing problem-solving under time constraints</li>
                  <li>Studying system design (for senior roles)</li>
                  <li>Preparing examples of past projects</li>
                </ul>
                <br />
                <p>Mock interviews with peers can also help simulate the real interview environment and reduce anxiety.</p>
              </div>
            </details>
          </div>

          {/* FAQ Item 2 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                What should I wear to a job interview?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>For most tech companies, <span className={styles.highlight}>business casual attire</span> is appropriate. This typically means a button-down shirt or blouse with slacks or a skirt. For more traditional companies or senior positions, consider wearing a suit.</p>
                <br />
                <p>Research the company culture beforehand. Startups tend to be more casual, while enterprise companies may expect more formal attire. When in doubt, it's better to be slightly overdressed than underdressed.</p>
                <br />
                <p>Regardless of the dress code, ensure your clothes are clean, wrinkle-free, and professional.</p>
              </div>
            </details>
          </div>

          {/* FAQ Item 3 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                How do I answer the "Tell me about yourself" question?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>Structure your answer in three parts:</p>
                <br />
                <p><span className={styles.highlight}>1. Present:</span> Start with your current role and a key achievement</p>
                <p><span className={styles.highlight}>2. Past:</span> Briefly explain your background and how you got to where you are</p>
                <p><span className={styles.highlight}>3. Future:</span> Connect your experience to why you're interested in this position</p>
                <br />
                <p>Keep it professional and relevant to the job, focusing on your skills and experiences that align with the role. Aim to keep your answer under 2 minutes to maintain the interviewer's interest.</p>
              </div>
            </details>
          </div>

          {/* FAQ Item 4 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                How can I handle difficult behavioral questions?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>Use the <span className={styles.highlight}>STAR method</span> to structure your answers:</p>
                <br />
                <p><span className={styles.highlight}>Situation:</span> Set the context for your story</p>
                <p><span className={styles.highlight}>Task:</span> Explain your responsibility in that situation</p>
                <p><span className={styles.highlight}>Action:</span> Describe the steps you took to address it</p>
                <p><span className={styles.highlight}>Result:</span> Share the outcomes of your actions</p>
                <br />
                <p>Prepare stories from your past experiences that demonstrate leadership, teamwork, problem-solving, and other relevant skills. Be specific about your contributions and the outcomes, and practice your delivery to ensure you're concise and clear.</p>
              </div>
            </details>
          </div>

          {/* FAQ Item 5 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                What questions should I ask the interviewer?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>Prepare thoughtful questions about the <span className={styles.highlight}>role, team, company culture, and growth opportunities</span>. Good examples include:</p>
                <br />
                <ul style={{marginLeft: "20px"}}>
                  <li>"What does success look like in this role after 6 months?"</li>
                  <li>"What are the biggest challenges the team is currently facing?"</li>
                  <li>"How would you describe the company culture?"</li>
                  <li>"What opportunities for professional development does the company offer?"</li>
                  <li>"What do you enjoy most about working here?"</li>
                </ul>
                <br />
                <p>Avoid questions about salary, benefits, or vacation time in initial interviews unless the interviewer brings them up first.</p>
              </div>
            </details>
          </div>

          {/* FAQ Item 6 */}
          <div className={styles["faq-item"]}>
            <details>
              <summary>
                How do I negotiate a job offer?
                <div className={styles["gradient-border"]}></div>
              </summary>
              <div className={styles.answer}>
                <p>Research the <span className={styles.highlight}>market rate</span> for your position and location using sites like Glassdoor, PayScale, or by networking with peers. When receiving an offer:</p>
                <br />
                <ul style={{marginLeft: "20px"}}>
                  <li>Express enthusiasm but ask for time to consider it</li>
                  <li>Focus on your value to the company rather than personal needs</li>
                  <li>Consider the entire compensation package, not just salary</li>
                  <li>Be prepared with specific numbers based on your research</li>
                  <li>Practice your negotiation conversation beforehand</li>
                </ul>
                <br />
                <p>Be professional and collaborative in your approach to negotiation. Remember that benefits, remote work options, flexible hours, and professional development opportunities can also be negotiated.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles["contact-section"]}>
          <h2>Still Have Questions?</h2>
          <p>Our interview coaches are here to help you prepare for your next big opportunity.</p>
          <a href="#" className={styles["contact-button"]}>Contact an Expert</a>
        </div>
      </div>
    </div>
  )
}
