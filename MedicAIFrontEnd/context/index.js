import { useReducer, createContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter, userRouter } from 'next/router';
import { axiosConfig } from '../config/axios';

// initial state
const intialState = {
  user: null,
};

// create context
const Context = createContext();

// root reducer
const rootReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return { ...state, user: null };

    default:
      return state;
  }
};

// context provider
const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, intialState);

  // router
  const router = useRouter();

  useEffect(() => {
    dispatch({
      type: 'LOGIN',
      payload: JSON.parse(window.localStorage.getItem('user')),
    });
  }, []);

  axiosConfig.interceptors.response.use(
    function (response) {
      // any status code that lie within the range of 2XX cause this function
      // to trigger
      return response;
    },
    function (error) {
      // any status codes that falls outside the range of 2xx cause this function
      // to trigger
      let res = error.response; //once the cookie expires this function runs and if these conditions true it means it has expired and we have to logout
      if (res.status === 401 && res.config && !res.config.__isRetryRequest) {
        return new Promise((resolve, reject) => {
          axiosConfig
            .get('/logout')
            .then((data) => {
              console.log('/401 error > logout');
              dispatch({ type: 'LOGOUT' });
              window.localStorage.removeItem('user');
              router.push('/login');
            })
            .catch((err) => {
              console.log('AXIOS INTERCEPTORS ERR', err);
              reject(error);
            });
        });
      }
      return Promise.reject(error);
    }
  );

  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
};

export { Context, Provider };
