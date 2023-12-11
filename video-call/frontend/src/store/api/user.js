import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAvailableUsers, setUser } from '../slices/usersSlice';

const userFetchApi = createApi({
  reducerPath: "fetchUsers",
  baseQuery: fetchBaseQuery({
    baseUrl: ' https://fac6-121-243-82-214.ngrok-free.app'
  }),
  endpoints(builder) {
    return {
      fetchUser: builder.query({
        query: (authToken=localStorage.getItem('token')) => ({
          url: '/users',
          headers: {
            authorization: `Bearer ${authToken}`
          },
          method: 'GET'
        }),
        async onQueryStarted(args, { dispatch, queryFulfilled} ) {
          try {
            const { data } = await queryFulfilled;
            dispatch(setAvailableUsers(data))
          } catch (error) {
            
          }
        }
      })
    }
  }
})

export const { useFetchUserQuery } = userFetchApi;
export { userFetchApi };