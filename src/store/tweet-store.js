
import axios from 'axios'
import ServerService from '@/services/server-service'
import DataUtil from '@/util/data-util'
import Papa from 'papaparse'

export default {
  namespaced: true,
  state: {
    tweetResponse: {
      fileName: '',
      isStreaming: false,
      link: ''
    },
    tweets: []
  },
  getters: {
    getTweetResponse (state) {
      return state.tweetResponse
    },
    getTweets (state) {
      return state.tweets
    }
  },
  mutations: {
    crawlTweets (state, payload) {
      let url = ServerService.getCrawlingTweetEndpoint()
      let formData = new FormData()
      formData.append('keyword', payload.keyword)
      formData.append('location', payload.location)
      formData.append('userId', payload.userId)
      formData.append('language', payload.language)
      formData.append('maxMinute', payload.maxMinute)
      axios.post(url, formData).then(response => {
        state.tweetResponse = DataUtil.responseToTweetResponse(response, ServerService.getDataEndpoint())
      }).catch(function (error) {
        console.log(error)
      })
    },
    stopCrawling (state) {
      let url = ServerService.getStopCrawlingTweetEndpoint()
      let formData = new FormData()
      formData.append('fileName', state.tweetResponse.fileName)
      axios.post(url, formData).then(response => {
        state.tweetResponse = DataUtil.responseToTweetResponse(response, ServerService.getDataEndpoint())
      }).catch(function (error) {
        console.log(error)
      })
    },
    loadCsv (state) {
      let url = ServerService.getDataEndpoint() + state.tweetResponse.fileName
      Papa.parse(url, {
        header: true,
        dynamicTyping: true,
        download: true,
        complete: (results, file) => {
          results.data.pop()
          state.tweets = results.data
        }
      })
    }
  },
  actions: {
    crawlTweets (context, payload) {
      context.commit('crawlTweets', payload)
    },
    stopCrawling (context) {
      context.commit('stopCrawling')
    },
    loadCsv (context) {
      context.commit('loadCsv')
    }
  }
}
