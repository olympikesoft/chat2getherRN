import React from 'react'
import { View } from 'react-native'
import styled from 'styled-components'
import { useApolloClient } from '@apollo/react-hooks'
import { GET_USERS } from '../../queries/queries'
import Svg, { Circle, Polyline, Text, Path } from 'react-native-svg'

const StatsContainer = styled.View`
  max-height: 45%;
  /* overflow-y: auto; */
`

export default function Stats() {
  // const [users, setUsers] = useState([])
  // const [genderCounts, setGenderCounts] = useState([])
  const [userCountLines, setUserCountLines] = React.useState()

  const numIntervals = 6
  const numIntervalsY = 2
  const intervalRange = 60 * 24 * 7 // minutes
  const vb = { x: 1200, y: 800 }
  const graph = { x: vb.x * (3 / 5), y: vb.y * (3 / 5) }
  const gStart = { x: vb.x / 5, y: vb.y / 5 }
  const gEnd = { x: vb.x * (4 / 5), y: vb.y * (4 / 5) }
  const intSpace = { x: graph.x / (numIntervals - 1), y: graph.y / numIntervalsY }

  const list = React.useRef([])
  const maxLineHeight = React.useRef(0)

  const client = useApolloClient()
  // Pull all users in past x hours, associate timestamp
  // Count using both updatedAt and createdAt, based on intervals
  // Consolidate into 4 1d arrays (one per gender) using intervals of i
  // If timestamp rolls over into next group, re-fetch
  // Procedurally draw SVG lines

  const getGroupings = () => {
    const usersList = list.current
    const d = new Date()
    // arr['gender'][1]
    const timeInts = Array(numIntervals + 1)
      .fill(0)
      .map((val, index) => new Date().setMinutes(d.getMinutes() - index * intervalRange))
    const genderArrs = {
      MALE: Array(numIntervals).fill(0),
      FEMALE: Array(numIntervals).fill(0),
      F2M: Array(numIntervals).fill(0),
      M2F: Array(numIntervals).fill(0),
    }
    // Go through each user, get their updatedAt and createdAt
    // go through time intervals, if interval is between updatedAt and createdAt add 1 to specific gender array
    for (const user of usersList) {
      for (const [index, timeInt] of timeInts.entries()) {
        if (
          index < numIntervals &&
          Date.parse(user.updatedAt) > timeInts[index + 1] &&
          Date.parse(user.createdAt) < timeInt
        ) {
          genderArrs[user.gender][index] += 1
          const num = genderArrs[user.gender][index]
          maxLineHeight.current = Math.max(num, maxLineHeight.current)
        }
      }
    }
    console.log(genderArrs)
    return genderArrs
  }

  const getLine = (genderArrs, gender) => {
    if (genderArrs.length < 1) return ''
    const arr = genderArrs[gender]
    const points = Array(numIntervals)
      .fill(0)
      .map((val, index) => ({
        x: gEnd.x - index * intSpace.x,
        y: gEnd.y - (arr[index] / maxLineHeight.current) * graph.y,
      }))
    const circles = points.map((val, idx) => {
      return (
        <Circle
          key={idx}
          // className={`graph-circle ${gender.toLowerCase()}`}
          cx={points[idx].x}
          cy={points[idx].y}
          onPress={() => console.log('click')}
        />
      )
    })

    return (
      <>
        <Polyline
          points={points.map(val => `${val.x} ${val.y}`).join(', ')}
          className={`graph-line ${gender.toLowerCase()}`}
        />
        {circles}
      </>
    )
  }

  const getAxis = () => {
    const xVals = Array(numIntervals)
      .fill(0)
      .map((val, idx) => {
        if (idx % 2 === 0) {
          return (
            <Text x={gStart.x + intSpace.x * idx} y={gEnd.y + 40} key={idx} className="axis-unit">
              {(intervalRange / 60) * (numIntervals - idx - 1)}
            </Text>
          )
        }
        return null
      })
    return (
      <>
        {xVals}
        <Text x={vb.x / 2} y={vb.y * 0.95} className="axis-label">
          Hours ago
        </Text>

        <Text x={gEnd.x + 20} y={gStart.y} className="axis-unit left-align">
          {maxLineHeight.current}
        </Text>
        <Text x={gEnd.x + 20} y={gStart.y + intSpace.y * (numIntervalsY / 2)} className="axis-unit left-align">
          {Math.round(maxLineHeight.current / 2)}
        </Text>
        <Text
          x={vb.x * 0.95}
          y={vb.y / 2}
          className="axis-label"
          rotate="0"
          transform={`rotate(90, ${vb.x * 0.95} ${vb.y / 2})`}
        >
          Users
        </Text>
      </>
    )
  }



  const getUserCount = async () => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - intervalRange * numIntervals)
    const where = { where: { updatedAt_gt: d.toISOString() } }
    const { loading, error, data } = await client.query({ query: GET_USERS, variables: where })
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error</p>
    // setUsers({timestamp: new Date(), list: data.users})
    list.current = data.users
    // const axis = getAxis()
    // console.log(axis)
    return (
      <>
        {getLine(getGroupings(), 'MALE')}
        {getLine(getGroupings(), 'FEMALE')}
        {getLine(getGroupings(), 'M2F')}
        {getLine(getGroupings(), 'F2M')}
        {getAxis()}
      </>
    )
  }
  React.useEffect(() => {
    (async () => setUserCountLines(await getUserCount()))()
  }, [getUserCount])
  const ticksX = Array(numIntervals - 1)
    .fill(0)
    .reduce((acc, cur, idx) => `${acc || ''} M${gStart.x + idx * intSpace.x} ${gEnd.y - 10} v 20`, 0)

  const ticksY = Array(numIntervalsY)
    .fill(0)
    .reduce((acc, cur, idx) => `${acc || ''} M${gEnd.x - 10} ${gStart.y + idx * intSpace.y} h 20`, 0)

  return (
    <StatsContainer>
      <Svg width={400} height={400} viewBox={`0 0 ${vb.x} ${vb.y}`} xmlns="http://www.w3.org/2000/svg">
        <Path d={`M${gStart.x} ${gEnd.y} H ${gEnd.x} V ${gStart.y}`} fill="none" stroke="#000" />
        <Path d={ticksX} strokeWidth={8} fill="none" stroke="#555" />
        <Path d={ticksY} strokeWidth={8} fill="none" stroke="#555" />
        {userCountLines}
      </Svg>
    </StatsContainer>
  )
}
