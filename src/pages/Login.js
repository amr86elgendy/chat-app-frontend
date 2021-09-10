import React, { useState } from 'react'
import {Container, Row, Col, Form, Button } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { useAuthDispatch } from '../context/auth'

const LOGIN_USER = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      email
      createdAt
      token
    }
  }
`

export default function Register(props) {
  const [variables, setVariables] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const dispatch = useAuthDispatch()

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    onError: (err) => {
      setErrors(err.graphQLErrors[0].extensions.errors)},
    onCompleted(data) {
      dispatch({ type: 'LOGIN', payload: data.login })
      window.location.href = '/'
    },
  })

  const submitLoginForm = (e) => {
    e.preventDefault()

    loginUser({ variables })
  }

  return (
    <Container>
      <Row className='mt-5 justify-content-md-center'>
        <Col xs={12} md={6}>
          <h1 className='mb-5'>
            <i className='fas fa-user'></i> Log In
          </h1>
          <Form onSubmit={submitLoginForm}>
            <Form.Group controlId='email'>
              <Form.Label className={errors.username && 'text-danger'}>
                {errors.username ?? 'Username'}
              </Form.Label>
              <Form.Control
                type='text'
                value={variables.username}
                className={errors.username && 'is-invalid'}
                onChange={(e) =>
                  setVariables({ ...variables, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && 'text-danger'}>
                {errors.password ?? 'Password'}
              </Form.Label>
              <Form.Control
                type='password'
                value={variables.password}
                className={errors.password && 'is-invalid'}
                onChange={(e) =>
                  setVariables({ ...variables, password: e.target.value })
                }
              />
            </Form.Group>
            <div className='my-4 text-center'>
              <Button type='submit' variant='primary' disabled={loading} className='mb-3'>
                {loading ? 'loading..' : 'Login'}
              </Button>
              <br />
              <small>
                Don't have an account? <Link to='/register'>Register</Link>
              </small>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

//  <Container>
//       <Row className="mt-5 justify-content-md-center">
//         <Col xs={12} md={6}>
//           {!loading && <h1 className="mb-5"><i className="fas fa-user"></i> Log In</h1>}
//           {error && <Error variant="danger">{error}</Error>}
//           {loading ? (
//             <Loading />
//           ) : (
//             <Form onSubmit={handleSubmit}>
//               <Form.Group controlId="email">
//                 <Form.Label>Email Address</Form.Label>
//                 <Form.Control
//                   type="email"
//                   placeholder="Enter email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 ></Form.Control>
//               </Form.Group>

//               <Form.Group controlId="password">
//                 <Form.Label>Password</Form.Label>
//                 <Form.Control
//                   type="password"
//                   placeholder="Enter password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 ></Form.Control>
//               </Form.Group>

//               <Button type="submit" variant="primary">
//                 Log In
//               </Button>
//             </Form>
//           )}
//         </Col>
//       </Row>
//     </Container>
