import axios from 'axios'
import qs from 'qs'

axios.defaults.adapter = require('axios/lib/adapters/http');

const Http = axios.create({
  maxRedirects:0,
  timeout: 10000
})

Http.headers = {
  // 'Content-Type': 'application/x-www-form-urlencoded',
  'Referer': 'pan.baidu.com',
  'User-Agent': 'pan.baidu.com'
}

Http.interceptors.response.use(
  response => { 
    // console.log('response')
    if (response.status != 200 ) {  
      console.log(response.status)
    } else {
      return response;
    }
  },
  error => {
    console.log('error',error.response.status)
    // console.log(error.response)
    if (error.response.status == 302 ) {  
      // console.log(error.response)
      return error.response.headers
    }

    return error.response;
  }
);

Http.interceptors.request.use(
  config => {
    config.headers = Http.headers
    // console.log(config.headers)
    config.data = qs.stringify(config.data) // 转为formdata数据格式
    return config
  },
  error => {
    console.log('error',error)
    Promise.resolve(error)
  }
)

export default Http