import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      setError('Le nom et l\'email sont obligatoires');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // Exécuter reCAPTCHA
      const token = executeRecaptcha ? await executeRecaptcha('contact_form') : null;

      const { error: supabaseError } = await supabase
        .from('contacts')
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            recaptcha_token: token
          }
        ]);

      if (supabaseError) throw supabaseError;

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('error');
      setError('Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Contactez-nous</h2>
      
      {status === 'success' ? (
        <div className="text-green-600 p-4 bg-green-50 rounded">
          Message envoyé avec succès ! Nous vous répondrons bientôt.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre email*
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              rows={5}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      )}
    </div>
  );
}
