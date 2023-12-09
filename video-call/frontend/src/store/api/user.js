import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAvailableUsers, setUser } from '../slices/usersSlice';

const userFetchApi = createApi({
  reducerPath: "fetchUsers",
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000'
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