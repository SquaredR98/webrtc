import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser } from '../slices/usersSlice';
import { setLocalStorage } from '../../utils/localStorage';

const userLoginApi = createApi({
  reducerPath: "loginUser",
  baseQuery: fetchBaseQuery({
    baseUrl: ' https://fac6-121-243-82-214.ngrok-free.app'
  }),
  endpoints(builder) {
    return {
      loginUser: builder.mutation({
        query: (userdata) => ({
          url: '/login',
          body: userdata,
          method: 'POST'
        }),
        async onQueryStarted(args, { dispatch, queryFulfilled} ) {
          try {
            const { data } = await queryFulfilled;
            setLocalStorage('token', data.data.token)
            setLocalStorage('user', data.data);
            dispatch(setUser(data.data))
          } catch (error) {
            
          }
        }
      })
    }
  }
})

export const { useLoginUserMutation } = userLoginApi;
export { userLoginApi };