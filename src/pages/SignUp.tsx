import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import SignupForm from '../components/auth/SignupForm';
import VerificationForm from '../components/auth/VerificationForm';
import { useAuth } from '@/context/AuthContext';

const SignUp = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const seoData = useSEO({
    title: 'Create Account - Join B3F Prints',
    description: 'Create your B3F Prints account to start designing custom products, save your designs, and track your orders.',
    keywords: 'sign up, create account, register, join, new account'
  });

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto max-w-md px-4 pb-24 mt-10">
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h1 className="text-2xl font-bold text-center mb-6 bg-blue-600 text-white py-2 rounded">
            Sign Up
          </h1>
          
          {isOtpSent ? (
            <VerificationForm 
              userEmail={userEmail}
              userPassword={userPassword}
              userData={userData}
              onBack={() => setIsOtpSent(false)}
            />
          ) : (
            <SignupForm 
              onVerificationSent={(email, password, data) => {
                setUserEmail(email);
                setUserPassword(password);
                setUserData(data);
                setIsOtpSent(true);
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
