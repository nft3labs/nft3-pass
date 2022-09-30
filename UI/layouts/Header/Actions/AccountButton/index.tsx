import type { FC } from 'react'
import { useState, Fragment } from 'react'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useRouter } from 'next/router'
import { useNFT3, useUser } from 'domains/data'
import { H4 } from 'components/Typography'
import * as sessionStorage from 'app/utils/cache/sessionStorage'
import { useTheme } from '@mui/material/styles'
import { safeGet } from 'app/utils/get'

const AccountButton: FC = () => {
  const { format } = useNFT3()
  const { didname, account, logout, selectDialog, disconnect, profile } = useUser()
  const router = useRouter()
  const theme = useTheme()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const onLogout = () => {
    handleClose()
    disconnect()
    sessionStorage.removeItem('sessionKey')
    logout()
  }

  if (!account) {
    return (
      <Button variant="gradient" onClick={() => selectDialog.open()}>
        Login
      </Button>
    )
  }
  if (!didname) {
    return <Button variant="outlined">Logging in</Button>
  }
  return (
    <Fragment>
      <Paper
        component="button"
        elevation={3}
        sx={{
          p: '10px 20px',
          borderRadius: '12px',
          border: 'solid 1px transparent',
          '&:hover': {
            cursor: 'pointer',
            borderColor: theme.palette.primary.main,
          },
        }}
        onClick={handleClick}
      >
        <Stack spacing={2} direction="row" justifyContent="center">
          <Avatar
            alt={profile.name}
            src={format(profile.avatar)}
            sx={{
              width: 36,
              height: 36,
            }}
          />
          <H4 fontWeight="medium" lineHeight="36px">
            {didname}
          </H4>
        </Stack>
      </Paper>
      <Menu
        sx={{
          marginTop: 1,
          '.MuiList-root': {
            padding: '6px 0',
            width: 180,
          },
          '.MuiSvgIcon-root': {
            color: 'text.primary',
          },
          '.MuiMenuItem-root': {
            padding: '12px 20px',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            router.push('/profile/' + safeGet(() => didname.split('.isme')[0]))
            handleClose()
          }}
          sx={{
            borderBottom: `solid 1px ${theme.palette.divider}`,
          }}
        >
          <ListItemIcon>
            <PersonRoundedIcon />
          </ListItemIcon>
          <ListItemText>View profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push('/edit-profile')
            handleClose()
          }}
          sx={{
            borderBottom: `solid 1px ${theme.palette.divider}`,
          }}
        >
          <ListItemIcon>
            <EditRoundedIcon />
          </ListItemIcon>
          <ListItemText>Edit profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default AccountButton
