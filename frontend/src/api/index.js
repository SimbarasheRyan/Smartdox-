import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
        localStorage.setItem('access', data.access)
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const login = (u, p) => api.post('/auth/token/', { username: u, password: p })
export const register = (data) => api.post('/accounts/register/', data)
export const getMe = () => api.get('/accounts/me/')
export const getUsers = (q = '') => api.get('/accounts/users/' + (q ? '?q='+q : ''))
export const createUser = (data) => api.post('/accounts/users/', data)
export const updateUser = (id, data) => api.patch('/accounts/users/'+id+'/', data)
export const deleteUser = (id) => api.delete('/accounts/users/'+id+'/')
export const setPassword = (id, new_password) => api.post('/accounts/users/'+id+'/set_password/', { new_password })
export const activateUser = (id) => api.post('/accounts/users/'+id+'/activate/')
export const deactivateUser = (id) => api.post('/accounts/users/'+id+'/deactivate/')
export const getDocuments = (params = {}) => api.get('/documents/', { params })
export const getDocument = (id) => api.get('/documents/'+id+'/')
export const createDocument = (fd) => api.post('/documents/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateDocument = (id, data) => api.patch('/documents/'+id+'/', data)
export const deleteDocument = (id) => api.delete('/documents/'+id+'/')
export const archiveDocument = (id) => api.post('/documents/'+id+'/archive/')
export const unarchiveDocument = (id) => api.post('/documents/'+id+'/unarchive/')
export const softDeleteDocument = (id) => api.post('/documents/'+id+'/soft_delete/')
export const restoreDocument = (id) => api.post('/documents/'+id+'/restore/')
export const hardDeleteDocument = (id) => api.delete('/documents/'+id+'/hard_delete/')
export const uploadVersion = (id, file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/documents/'+id+'/upload-version/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getTags = () => api.get('/tags/')
export const createTag = (name) => api.post('/tags/', { name })
export const getAuditLogs = (params = {}) => api.get('/audit/', { params })

export default api
