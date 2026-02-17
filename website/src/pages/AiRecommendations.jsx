import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAiRecommendations } from '../services/api';
import '../styles/App.css';

const AiRecommendations = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        roomType: '',
        mood: '',
        colors: '',
        lighting: '',
        style: ''
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const questions = [
        {
            key: 'roomType',
            question: "Which room are we designing for?",
            options: ['Living Room', 'Bedroom', 'Office', 'Kids Room', 'Dining Room']
        },
        {
            key: 'mood',
            question: "What vibe do you want to create?",
            options: ['Calm & Peaceful', 'Energizing & Bright', 'Cozy & Professional', 'Luxurious & Bold', 'Playful & Fun']
        },
        {
            key: 'style',
            question: "Choose your favorite design aesthetic:",
            options: ['Modern Minimalist', 'Classic Elegance', 'Industrial Chic', 'Bohemian Soul', 'Scandinavian']
        },
        {
            key: 'colors',
            question: "What's your preferred color palette?",
            options: ['Soft Pastels', 'Earth Tones', 'Monochrome (B&W)', 'Rich Jewel Tones', 'Vibrant Primary']
        },
        {
            key: 'lighting',
            question: "How much natural light does the room get?",
            options: ['Flooded with light', 'Moderate', 'Mostly artificial light']
        }
    ];

    const currentQuestion = questions[step];

    const handleOptionSelect = (option) => {
        const updatedAnswers = { ...answers, [currentQuestion.key]: option };
        setAnswers(updatedAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit(updatedAnswers);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAiRecommendations(finalAnswers);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError("Stenna AI encountered a wrinkle. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers({});
        setResults(null);
        setError(null);
    };

    if (loading) {
        return (
            <div className="recommendations-page" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 2rem' }}></div>
                <h3 className="fade-in">Stenna AI is curating your collection...</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Analyzing {answers.style} trends and {answers.mood.toLowerCase()} palettes.</p>
            </div>
        );
    }

    if (results) {
        return (
            <div className="recommendations-page">
                <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2>Your Personalized Collection</h2>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>{results.summary}</p>
                    <p style={{ maxWidth: '800px', margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{results.description}</p>
                    <button
                        className="btn-primary"
                        onClick={resetQuiz}
                        style={{
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary-color), #2d3436)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 2rem',
                            cursor: 'pointer',
                            borderRadius: '50px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        Take Quiz Again
                    </button>
                </header>

                {results.recommendations?.length > 0 ? (
                    <div className="grid grid-cols-3">
                        {results.recommendations.map((item) => (
                            <div key={item.id} className="card product-card">
                                <Link to={`/wallpaper/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="product-image" style={{ height: '280px', overflow: 'hidden' }}>
                                        <img
                                            src={item.images?.[0]?.image_url || 'https://via.placeholder.com/400x400?text=Stenna+Design'}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="tag">AI Match</div>
                                    </div>
                                    <div className="product-info">
                                        <h3>{item.name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{item.design_code}</p>
                                        <p style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <p>We couldn't find an exact match for that specific combination.</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try broadening your style or color preferences!</p>
                        <button className="filter-btn active" onClick={resetQuiz} style={{ marginTop: '1.5rem' }}>Retry Quiz</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="recommendations-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>AI Designer</h2>
                <p>Answer {questions.length} questions and let Stenna AI find your perfect interior vibe.</p>
            </header>

            <div className="card" style={{ padding: '3rem', border: '2px solid var(--primary-color)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Question {step + 1} of {questions.length}
                </div>

                <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '2px', marginBottom: '3rem' }}>
                    <div style={{
                        width: `${((step + 1) / questions.length) * 100}%`,
                        height: '100%',
                        background: 'var(--primary-color)',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>

                <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>{currentQuestion.question}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option}
                            className="filter-btn"
                            style={{
                                padding: '1.5rem',
                                border: '1px solid #ddd',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleOptionSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {step > 0 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginTop: '2rem', cursor: 'pointer' }}
                    >
                        ← Back to previous question
                    </button>
                )}
            </div>

            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '2rem' }}>{error}</p>}
        </div>
    );
};

export default AiRecommendations;
