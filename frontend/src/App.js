import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Initialement vide
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [events, setEvents] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState('participant');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/login/', { email, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('role', res.data.role);
      setUserId(res.data.user_id);
      setRole(res.data.role);
      checkAuth();
      if (res.data.role === 'participant') {
        await fetchEvents();
      }
      setMessage('');
    } catch (error) {
      setMessage('Échec de la connexion.');
      console.error('Login failed:', error.response ? error.response.data : error);
    }
  };

  const register = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/register/', { email, password, role: selectedRole });
      setMessage(`Félicitations, vous êtes un ${selectedRole} authentifié !`);
      setIsRegistering(false);
    } catch (error) {
      setMessage(`Échec de l'inscription. Détail : ${error.response ? error.response.data.detail : error.message}`);
      console.error('Register failed:', error.response ? error.response.data : error);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const res = await axios.get('http://localhost:8000/api/protected/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(res.data.message || `Authentification réussie en tant que ${role}.`);
      } catch (error) {
        setMessage('Authentification échouée.');
        console.error('Auth check failed:', error);
      }
    }
  };

  const fetchEvents = async () => {
    const token = localStorage.getItem('access_token');
    if (token && role === 'participant') {
      try {
        const res = await axios.get('http://localhost:8000/api/list-public-events/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    } else if (role !== 'participant') {
      setMessage('Vous n\'êtes pas autorisé à voir cette section.');
    }
  };

  useEffect(() => {
    if (role) {
      checkAuth();
      if (role === 'participant') {
        fetchEvents();
      }
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Eventify</h1>
          {!role && (
            <button
              onClick={() => setIsRegistering(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-gray-200"
            >
              S'inscrire
            </button>
          )}
        </div>
      </nav>

      <div className="pt-16 container mx-auto p-4">
        {!message && !isRegistering ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Messagerie électronique"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full p-2 mb-4 border rounded"
            />
            <button
              onClick={login}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
            <p className="mt-4 text-center">
              Vous n'avez pas de compte ?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-blue-600 hover:underline"
              >
                S'inscrire
              </button>
            </p>
          </div>
        ) : isRegistering ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Messagerie électronique"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="participant">Participant</option>
              <option value="organisateur">Organisateur</option>
            </select>
            <button
              onClick={register}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              S'inscrire
            </button>
            <p className="mt-4 text-center">
              Déjà inscrit ?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="text-blue-600 hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        ) : role === 'participant' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Bienvenue Participant {userId}</h2>
            <p className="mt-2">{message}</p>
            <p className="mt-2">Actions : Consulter événements publics</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Événements publics</h3>
              <ul className="list-disc pl-5 mt-2">
                {events.length > 0 ? (
                  events.map(event => (
                    <li key={event.id}>{event.title} - {new Date(event.date).toLocaleDateString()}</li>
                  ))
                ) : (
                  <p>Aucun événement public pour le moment.</p>
                )}
              </ul>
            </div>
          </div>
        ) : role === 'organisateur' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Bienvenue Organisateur {userId}</h2>
            <p className="mt-2">{message}</p>
            <p className="mt-2">Actions : Gérer événements</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="mt-2">{message}</p>
            <p className="mt-4 text-center">
              Vous n'avez pas de compte ?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="text-blue-600 hover:underline"
              >
                S'inscrire
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;