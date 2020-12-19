function sizeFormat(value){
  if (!value) return '-';
  if (value < powSize(1)) return value + ' B';
  if (value < powSize(2)) return (value / powSize(1)).toFixed(2) + ' KB';
  if (value < powSize(3)) return (value / powSize(2)).toFixed(2) + ' MB';
  if (value < powSize(4)) return (value / powSize(3)).toFixed(2) + ' GB';
  return (value / powSize(4)).toFixed(2) + ' TB'
}

function powSize(num) {
  return Math.pow(1024, num)
}

function inArray(search,array) {
  for(let i in array){
      if(array[i]==search){
          return true;
      }
  }
  return false;
}

function filename(url)
{
   if (url)
   {
      var m = url.toString().match(/.*\/(.+?)\./);
      if (m && m.length > 1)
      {
         return m[1];
      }
   }
   return "";
}

function timeRemaining (totalLength, completedLength, downloadSpeed) {
  const remainingLength = totalLength - completedLength
  return Math.ceil(remainingLength / downloadSpeed)
}

function calcProgress (totalLength, completedLength) {
  const total = parseInt(totalLength, 10)
  const completed = parseInt(completedLength, 10)
  if (total === 0 || completed === 0) {
      return 0
  }
  const percentage = completed / total * 100
  const result = parseFloat(percentage.toFixed(2))
  return result
}

function fileToBase64(file){
  return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result.split('base64,')[1]
            resolve(result)
        }
        reader.onerror = () => {
            reject()
        }
    })
}

function bytesToSize (bytes) {
  const b = parseInt(bytes, 10)
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (b === 0) { return '0 KB' }
  const i = parseInt(Math.floor(Math.log(b) / Math.log(1024)), 10)
  if (i === 0) { return `${b} ${sizes[i]}` }
  return `${(b / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

function timesFormat (seconds, { prefix = '', suffix = '', i18n }) {
  let result = ''
  let hours = ''
  let minutes = ''
  let secs = seconds || 0
  const i = {
    gt1d: '> 1 day',
    hour: 'h',
    minute: 'm',
    second: 's',
    ...i18n
  }

  if (secs <= 0) {
    return ''
  }
  if (secs > 86400) {
    return `${prefix} ${i.gt1d} ${suffix}`
  }
  if (secs > 3600) {
    hours = `${Math.floor(secs / 3600)}${i.hour} `
    secs %= 3600
  }
  if (secs > 60) {
    minutes = `${Math.floor(secs / 60)}${i.minute} `
    secs %= 60
  }
  secs += i.second
  result = hours + minutes + secs
  return result ? `${prefix} ${result} ${suffix}` : result
}

export default {
  fileToBase64,
  sizeFormat,
  timesFormat,
  bytesToSize,
  calcProgress,
  timeRemaining,
  filename,
  powSize,
  inArray
}