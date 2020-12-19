import Layout from '@/views/Layout'
import Home from '@/views/Home'
import Finished from '@/views/Finished'
import Settings from '@/views/Settings'
import Baiduwp from '@/views/Baiduwp'
import Share from '@/views/Share'
import Magnet from '@/views/Magnet'
import Torrent from '@/views/Torrent'
import ErrorPage from '@/views/ErrorPage'

const Routes = [
  {
      path: '',
      redirect: '/home',
      component: Layout,
      children: [
        {
            path: 'home',
            name: 'Home',
            component: Home
        },
        {
            path: 'finished',
            name: 'Finished',
            component: Finished
        },
        {
            path: 'settings',
            name: 'Settings',
            component: Settings
        },
        {
            path: 'baiduwp',
            name: 'Baiduwp',
            component: Baiduwp
        },
        {
            path: 'share',
            name: 'Share',
            component: Share
        },
        {
            path: 'magnet',
            name: 'Magnet',
            component: Magnet
        },
        {
            path: 'torrent',
            name: 'Torrent',
            component: Torrent
        }
      ]
  },
  { path: '/404', name: 'ErrorPage', component: ErrorPage},
  { path: '*', name: '404' , redirect: '/404'}
]


export default Routes