import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Card from '../components/Card';

const Feedback = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [message, setMessage] = useState('');

  // Load feedbacks on mount
  useEffect(() => {
    const saved = localStorage.getItem('farmer_feedbacks');
    if (saved) {
      setFeedbacks(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !comment) {
      setMessage('Name and Comment are required.');
      return;
    }

    const newFeedback = {
      id: uuidv4(),
      name,
      rating,
      comment,
      date: new Date().toLocaleDateString()
    };

    // Immutability in state update
    const updatedFeedbacks = [newFeedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    
    // Save to Local Storage using JSON stringify
    localStorage.setItem('farmer_feedbacks', JSON.stringify(updatedFeedbacks));
    
    // Clear form
    setName('');
    setRating('5');
    setComment('');
    setMessage('Thank you for your feedback!');
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="page-container">
      <h2 className="animate-slide-up">Farmer Feedback</h2>
      
      <div className="feedback-layout animate-fade-in delay-100">
        <Card title="Leave a Feedback" className="feedback-form-card animate-slide-in-left">
          {message && <div className="info-message">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your Name"
              />
            </div>
            <div className="form-group">
              <label>Rating (1-5):</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Comment:</label>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your thoughts..."
                rows="4"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary glow-on-hover w-100">Submit Feedback</button>
          </form>
        </Card>
        
        <div className="feedback-list">
          <h3>Recent Feedbacks</h3>
          {feedbacks.length === 0 ? (
            <p className="animate-fade-in" style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>No feedbacks yet. Be the first!</p>
          ) : (
            feedbacks.map((fb, index) => (
              <div 
                key={fb.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Card className="feedback-item">
                  <p><strong>{fb.name}</strong> - Rating: {fb.rating}/5</p>
                  <p>"{fb.comment}"</p>
                  <small>{fb.date}</small>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
