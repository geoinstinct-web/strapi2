import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { Box } from '@strapi/parts/Box';
import { Stack } from '@strapi/parts/Stack';
import { Main } from '@strapi/parts/Main';
import { Row } from '@strapi/parts/Row';
import { Link } from '@strapi/parts/Link';
import { Button } from '@strapi/parts/Button';
import { TextInput } from '@strapi/parts/TextInput';
import { Checkbox } from '@strapi/parts/Checkbox';
import { Grid, GridItem } from '@strapi/parts/Grid';
import { H1, Subtitle } from '@strapi/parts/Text';
import Hide from '@strapi/icons/Hide';
import Show from '@strapi/icons/Show';
import { FieldAction } from '@strapi/parts/Field';
import { Icon } from '@strapi/parts/Icon';
import { Form, useQuery, useNotification } from '@strapi/helper-plugin';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import axios from 'axios';
import UnauthenticatedLayout, {
  Column,
  LayoutContent,
} from '../../../../layouts/UnauthenticatedLayout';
import Logo from '../Logo';

const CenteredBox = styled(Box)`
  text-align: center;
`;
const A = styled.a`
  color: ${({ theme }) => theme.colors.primary600};
`;

const Register = ({ fieldsToDisable, noSignin, onSubmit, schema }) => {
  const toggleNotification = useNotification();
  const { push } = useHistory();
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const { formatMessage } = useIntl();
  const query = useQuery();
  const registrationToken = query.get('registrationToken');

  useEffect(() => {
    if (registrationToken) {
      const getData = async () => {
        try {
          const {
            data: { data },
          } = await axios.get(
            `${strapi.backendURL}/admin/registration-info?registrationToken=${registrationToken}`
          );

          if (data) {
            setUserInfo(data);
          }
        } catch (err) {
          const errorMessage = get(err, ['response', 'data', 'message'], 'An error occurred');

          toggleNotification({
            type: 'warning',
            message: errorMessage,
          });

          // Redirect to the oops page in case of an invalid token
          // @alexandrebodin @JAB I am not sure it is the wanted behavior
          push(`/auth/oops?info=${encodeURIComponent(errorMessage)}`);
        }
      };

      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationToken]);

  return (
    <UnauthenticatedLayout>
      <LayoutContent>
        <Formik
          enableReinitialize
          initialValues={{
            firstname: userInfo.firstname || '',
            lastname: userInfo.lastname || '',
            email: userInfo.email || '',
            password: '',
            confirmPassword: '',
            registrationToken: registrationToken || undefined,
            news: false,
          }}
          onSubmit={(data, formik) => {
            if (registrationToken) {
              // We need to pass the registration token in the url param to the api in order to submit another admin user
              onSubmit({ userInfo: omit(data, ['registrationToken']), registrationToken }, formik);
            } else {
              onSubmit(data, formik);
            }
          }}
          validationSchema={schema}
          validateOnChange={false}
        >
          {({ values, errors, handleChange }) => (
            <Form noValidate>
              <Main>
                <Column>
                  <Logo />
                  <Box paddingTop={6} paddingBottom={1}>
                    <H1>
                      {formatMessage({
                        id: 'Auth.form.welcome.title',
                        defaultMessage: 'Welcome!',
                      })}
                    </H1>
                  </Box>
                  <CenteredBox paddingBottom={7}>
                    <Subtitle textColor="neutral600">
                      {formatMessage({
                        id: 'Auth.form.register.subtitle',
                        defaultMessage:
                          'Your credentials are only used to authenticate yourself on the admin panel. All saved data will be stored in your own database.',
                      })}
                    </Subtitle>
                  </CenteredBox>
                </Column>
                <Stack size={7}>
                  <Grid gap={4}>
                    <GridItem col={6}>
                      <TextInput
                        name="firstname"
                        required
                        value={values.firstname}
                        error={
                          errors.firstname
                            ? formatMessage({
                                id: errors.firstname,
                                defaultMessage: 'This value is required.',
                              })
                            : undefined
                        }
                        onChange={handleChange}
                        label={formatMessage({
                          id: 'Auth.form.firstname.label',
                          defaultMessage: 'Firstname',
                        })}
                      />
                    </GridItem>
                    <GridItem col={6}>
                      <TextInput
                        name="lastname"
                        error={
                          errors.lastname
                            ? formatMessage({
                                id: errors.lastname,
                                defaultMessage: 'This value is required.',
                              })
                            : undefined
                        }
                        required
                        value={values.lastname}
                        onChange={handleChange}
                        label={formatMessage({
                          id: 'Auth.form.lastname.label',
                          defaultMessage: 'Lastname',
                        })}
                      />
                    </GridItem>
                  </Grid>
                  <TextInput
                    name="email"
                    disabled={fieldsToDisable.includes('email')}
                    value={values.email}
                    onChange={handleChange}
                    error={
                      errors.email
                        ? formatMessage({
                            id: errors.email,
                            defaultMessage: 'This value is required.',
                          })
                        : undefined
                    }
                    required
                    label={formatMessage({ id: 'Auth.form.email.label', defaultMessage: 'Email' })}
                    type="email"
                  />
                  <TextInput
                    name="password"
                    onChange={handleChange}
                    value={values.password}
                    error={
                      errors.password
                        ? formatMessage({
                            id: errors.password,
                            defaultMessage: 'This value is required',
                          })
                        : undefined
                    }
                    endAction={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <FieldAction
                        onClick={e => {
                          e.preventDefault();
                          setPasswordShown(prev => !prev);
                        }}
                        label={formatMessage(
                          passwordShown
                            ? {
                                id: 'Auth.form.password.show-password',
                                defaultMessage: 'Show password',
                              }
                            : {
                                id: 'Auth.form.password.hide-password',
                                defaultMessage: 'Hide password',
                              }
                        )}
                      >
                        {passwordShown ? (
                          <Icon as={Show} height="16px" width="16px" color="neutral600" />
                        ) : (
                          <Icon as={Hide} height="16px" width="16px" color="neutral600" />
                        )}
                      </FieldAction>
                    }
                    hint={formatMessage({
                      id: 'Auth.form.password.hint',
                      defaultMessage:
                        'Password must contain at least 8 characters, 1 uppercase, 1 lowercase and 1 number',
                    })}
                    required
                    label={formatMessage({
                      id: 'Auth.form.password.label',
                      defaultMessage: 'Password',
                    })}
                    type={passwordShown ? 'text' : 'password'}
                  />
                  <TextInput
                    name="confirmPassword"
                    onChange={handleChange}
                    value={values.confirmPassword}
                    error={
                      errors.confirmPassword
                        ? formatMessage({
                            id: errors.confirmPassword,
                            defaultMessage: 'This value is required.',
                          })
                        : undefined
                    }
                    endAction={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <FieldAction
                        onClick={e => {
                          e.preventDefault();
                          setConfirmPasswordShown(prev => !prev);
                        }}
                        label={formatMessage(
                          confirmPasswordShown
                            ? {
                                id: 'Auth.form.password.show-password',
                                defaultMessage: 'Show password',
                              }
                            : {
                                id: 'Auth.form.password.hide-password',
                                defaultMessage: 'Hide password',
                              }
                        )}
                      >
                        {confirmPasswordShown ? (
                          <Icon as={Show} height="16px" width="16px" color="neutral600" />
                        ) : (
                          <Icon as={Hide} height="16px" width="16px" color="neutral600" />
                        )}
                      </FieldAction>
                    }
                    required
                    label={formatMessage({
                      id: 'Auth.form.confirmPassword.label',
                      defaultMessage: 'Confirmation Password',
                    })}
                    type={confirmPasswordShown ? 'text' : 'password'}
                  />
                  <Checkbox
                    onValueChange={checked => {
                      handleChange({ target: { value: checked, name: 'news' } });
                    }}
                    value={values.news}
                    name="news"
                    aria-label="news"
                  >
                    {formatMessage(
                      {
                        id: 'Auth.form.register.news.label',
                        defaultMessage:
                          'Keep me updated about the new features and upcoming improvements (by doing this you accept the {terms} and the {policy}).',
                      },
                      {
                        terms: (
                          <A target="_blank" href="https://strapi.io/terms" rel="noreferrer">
                            {formatMessage({
                              id: 'Auth.privacy-policy-agreement.terms',
                              defaultMessage: 'terms',
                            })}
                          </A>
                        ),
                        policy: (
                          <A target="_blank" href="https://strapi.io/privacy" rel="noreferrer">
                            {formatMessage({
                              id: 'Auth.privacy-policy-agreement.policy',
                              defaultMessage: 'policy',
                            })}
                          </A>
                        ),
                      }
                    )}
                  </Checkbox>
                  <Button fullWidth size="L" type="submit">
                    {formatMessage({
                      id: 'Auth.form.button.register',
                      defaultMessage: "Let's start",
                    })}
                  </Button>
                </Stack>
              </Main>
            </Form>
          )}
        </Formik>
        {!noSignin && (
          <Box paddingTop={4}>
            <Row justifyContent="center">
              <Link label="Auth.link.signin" to="/auth/login">
                {formatMessage({
                  id: 'Auth.link.signin.account',
                  defaultMessage: 'Already have an account?',
                })}
              </Link>
            </Row>
          </Box>
        )}
      </LayoutContent>
    </UnauthenticatedLayout>
  );
};

Register.defaultProps = {
  fieldsToDisable: [],
  noSignin: false,
  onSubmit: e => e.preventDefault(),
};

Register.propTypes = {
  fieldsToDisable: PropTypes.array,
  noSignin: PropTypes.bool,
  onSubmit: PropTypes.func,
  schema: PropTypes.shape({ type: PropTypes.string.isRequired }).isRequired,
};

export default Register;
