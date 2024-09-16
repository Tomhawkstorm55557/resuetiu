import React, { useState, useEffect, Suspense, useTransition } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, CircularProgress, Link } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { OrbitControls, Cloud, Text } from '@react-three/drei';
import * as THREE from 'three';

const fetchRandomBackground = async () => {
  const response = await axios.get('https://picsum.photos/1920/1080', { responseType: 'blob' });
  return URL.createObjectURL(response.data);
};

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const image = await fetchRandomBackground();
        setBackgroundImage(image);
      } catch (error) {
        console.error('Error fetching background image:', error);
      }
    };

    startTransition(() => {
      fetchBackground();
    });
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
    setResumeData(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('http://localhost:3000/analyze-resume'
, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Simulate delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));

      setResumeData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const RotatingCloud = () => {
    const { rotation } = useSpring({
      rotation: [0, 0, 2 * Math.PI],
      config: { duration: 10000 },
      loop: { reverse: true },
    });

    const { color } = useSpring({
      loop: { reverse: true },
      from: { color: 'rgb(255,0,0)' },
      to: { color: 'rgb(0,0,255)' },
      config: { duration: 1000 },
    });

    return (
      <a.group rotation={rotation}>
        <Cloud position={[0, 0, -10]}>
          {resumeData?.skills?.map((skill, index) => (
            <a.mesh key={index} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10]}>
              <Text
                fontSize={1}
                color={color}
              >
                {skill}
              </Text>
            </a.mesh>
          ))}
        </Cloud>
      </a.group>
    );
  };

  return (
    <div style={{ 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Container maxWidth="sm" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Box mt={5}>
          <Typography variant="h4" gutterBottom align="center">
            Resume Analyzer
          </Typography>
          <TextField
            fullWidth
            type="file"
            onChange={handleFileChange}
            variant="outlined"
            label="Upload Resume (PDF)"
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: 20 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ marginBottom: 20 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Resume'}
          </Button>
          {error && (
            <Typography variant="body1" color="error" align="center" style={{ marginBottom: 20 }}>
              {error}
            </Typography>
          )}
          {resumeData && (
            <Box>
              <Typography variant="h5" gutterBottom align="center">
                Resume Analysis Results
              </Typography>
              {resumeData.name && (
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {resumeData.name}
                </Typography>
              )}
              {resumeData.email && (
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {resumeData.email}
                </Typography>
              )}
              {resumeData.jobTitle && (
                <Typography variant="body1" gutterBottom>
                  <strong>Job Title:</strong> {resumeData.jobTitle}
                </Typography>
              )}
              {resumeData.atsScore && (
                <Typography variant="body1" gutterBottom>
                  <strong>ATS Score:</strong> {resumeData.atsScore}
                </Typography>
              )}
              {resumeData.skills && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Skills Count:</strong> {resumeData.skills.length}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Skills:</strong> {resumeData.skills.join(', ')}
                  </Typography>
                </>
              )}
              {resumeData.achievements && (
                <Typography variant="body1" gutterBottom>
                  <strong>Achievements:</strong>
                  <ul>
                    {resumeData.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </Typography>
              )}
              {resumeData.skillsToLearn && (
                <Typography variant="body1" gutterBottom>
                  <strong>Skills to Learn:</strong> {resumeData.skillsToLearn.join(', ')}
                </Typography>
              )}
              {resumeData.recommendedCourses && (
                <Typography variant="body1" gutterBottom>
                  <strong>Recommended Courses:</strong>
                  <ul>
                    {resumeData.recommendedCourses.map((course, index) => (
                      <li key={index}>
                        <Link href={course[1]} target="_blank" rel="noopener">
                          {course[0]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Typography>
              )}
              <Typography variant="h6" gutterBottom>
                3D Skills Cloud
              </Typography>
              <Suspense fallback={<CircularProgress />}>
                <Canvas style={{ height: 500 }}>
                  <ambientLight />
                  <pointLight position={[10, 10, 10]} />
                  <OrbitControls />
                  <RotatingCloud />
                </Canvas>
              </Suspense>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default App;
