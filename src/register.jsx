import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Signing = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '', 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const toggleVisibility = () => setIsVisible(!isVisible);

  const isInvalid = React.useMemo(() => {
    if (formData.password.length === 0) return true;
    return formData.password.length > 10 ? false : true;
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isSignUp ? 'http://localhost:3008/auth/signup' : 'http://localhost:3008/auth/signin';

    const requestBody = isSignUp
      ? {
          username: formData.username,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          bio: formData.bio,
          profession: formData.profession,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Something went wrong');

      if (data.token) {
        localStorage.setItem('token', JSON.stringify(data.token));
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard'); // Using react-router-dom for redirection
      }

      if (isSignUp) setIsSignUp(!isSignUp);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-col w-[90%] h-fit max-w-md p-5 mx-auto shadow-lg border rounded-lg">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" className="m-3" alt="Logo" width={50} height={50} />
          <h2 className="text-blue-700">
            TASK <span className="text-cyan-500">FLOW</span>
          </h2>
          <div className="flex space-x-2 mt-4">
            <button
              className={`px-4 py-2 ${isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setIsSignUp(true)}
              disabled={isSignUp}
            >
              Sign Up
            </button>
            <button
              className={`px-4 py-2 ${!isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setIsSignUp(false)}
              disabled={!isSignUp}
            >
              Sign In
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {isSignUp ? (
            <>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type={isVisible ? 'text' : 'password'}
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="text-sm text-blue-500"
                onClick={toggleVisibility}
              >
                {isVisible ? 'Hide Password' : 'Show Password'}
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type={isVisible ? 'text' : 'password'}
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="text-sm text-blue-500"
                onClick={toggleVisibility}
              >
                {isVisible ? 'Hide Password' : 'Show Password'}
              </button>
            </>
          )}
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signing;
