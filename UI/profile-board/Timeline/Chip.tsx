import Image from 'next/image'
import type { StackTypeMap } from '@mui/material/Stack'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import type { TimelineRecord } from '@rootlabs/client'
import { NETWORK_MAP } from './netwrok'

export const ChipStack: FC<StackTypeMap<{}, 'div'>['props']> = (props) => (
  <Stack
    spacing={1}
    direction="row"
    sx={{
      '.MuiChip-root': {
        '.MuiChip-icon': {
          marginLeft: '10px',
        },
      },
    }}
    {...props}
  />
)

type ChipNetworkProps = Pick<TimelineRecord['item'], 'network'>
export const ChipNetwork: FC<ChipNetworkProps> = ({ network }) => {
  const item = NETWORK_MAP[network]
  if (!item) return null

  const { name, icon } = item

  return (
    <Chip
      sx={{
        backgroundColor: '#E9E9E9',
        color: '#666666',
        fontWeight: 'bold',
        '.MuiChip-icon': {
          color: '#666666',
        },
        // cursor: 'pointer',
      }}
      // onClick={() => {
      //   window.open(explorerUrl)
      // }}
      icon={
        <Box display="flex" alignItems="center">
          <Image src={icon} alt={network} width={22} height={22} />
        </Box>
      }
      label={name}
    />
  )
}
