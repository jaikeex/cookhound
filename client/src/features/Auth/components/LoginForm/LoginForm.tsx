import { Formik } from 'formik';
import * as React from 'react';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { FormikHelpers } from 'formik';
import { useLogin } from 'core';
import { CButton } from 'components';
import { FormPasswordInput, FormTextInput } from 'features';

const loginSchema = yup.object().shape({
  email: yup.string().email('invalid email').required('E-mail is required'),
  password: yup.string().required('Password is required')
});

const initialLoginValues = {
  email: '',
  password: ''
};

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = (): JSX.Element => {
  const { login, loading } = useLogin();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleFormSubmit = async (values: LoginFormValues, onSubmitProps: FormikHelpers<LoginFormValues>) => {
    if (await login(values.email, values.password)) {
      onSubmitProps.resetForm();
      navigate('/');
    }
  };

  return (
    <Formik onSubmit={handleFormSubmit} initialValues={initialLoginValues} validationSchema={loginSchema}>
      {({ values, errors, touched, handleBlur, handleSubmit, handleChange }) => (
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap="2rem">
            <FormTextInput
              label="E-mail"
              type="email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              name="email"
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={(touched.email && errors.email) || ' '}
            />
            <FormPasswordInput
              label="Password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              name="password"
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />
            <Box>
              <CButton
                fullWidth
                primary
                type="submit"
                size="large"
                sx={{
                  mb: 1
                }}
              >
                {loading ? <CircularProgress /> : 'Login'}
              </CButton>
              <Link to={'/auth/register'}>
                <Typography>Not registered yet? Create an account!</Typography>
              </Link>
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default LoginForm;
