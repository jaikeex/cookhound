import { Formik } from 'formik';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';
import type { FormikHelpers } from 'formik';
import { setLogin } from 'store/authSlice';
import { useLazyLoginQuery } from 'store/apiSlice';
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import { LOGIN_QUERY } from 'graphql/queries';

const loginSchema = yup.object().shape({
  email: yup.string().email('invalid email').required('required'),
  password: yup.string().required('required')
});

const initialLoginValues = {
  email: '',
  password: ''
};

interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = (props): JSX.Element => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();

  const [triggerLogin, { called, data }] = useLazyQuery(LOGIN_QUERY);

  const login = async (values: LoginFormValues, onSubmitProps: FormikHelpers<LoginFormValues>) => {
    triggerLogin({ variables: values });
    onSubmitProps.resetForm();
  };

  const formSubmitHandler = async (values: LoginFormValues, onSubmitProps: FormikHelpers<LoginFormValues>) => {
    login(values, onSubmitProps);
  };

  useEffect(() => {
    if (called && data) {
      dispatch(setLogin({ user: data.login.user }));
      navigate('/');
    }
  }, [called, data]);

  return (
    <Formik onSubmit={formSubmitHandler} initialValues={initialLoginValues} validationSchema={loginSchema}>
      {({ values, errors, touched, handleBlur, handleSubmit, handleChange, setFieldValue, resetForm }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="flex"
            flexDirection="column"
            gap="2rem"
            sx={{
              '& > div': {
                gridColumn: undefined
              }
            }}
          >
            <TextField
              label="E-mail"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              name="email"
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={(touched.email && errors.email) || ' '}
            />
            <TextField
              label="Password"
              type="password"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              name="password"
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={(touched.password && errors.password) || ' '}
            />
            <Box>
              <Button
                fullWidth
                type="submit"
                sx={{
                  m: '2rem 0',
                  p: '1rem',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  }
                }}
              >
                <Typography>Login</Typography>
              </Button>
              <Link to={'/register'}>
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