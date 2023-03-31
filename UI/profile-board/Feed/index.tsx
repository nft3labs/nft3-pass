import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import { H2, Span, Tiny } from '../../../components/Typography'
import { format as formatDate } from 'date-fns'
import Avatar from '@mui/material/Avatar'
import expandSvg from './expand.svg'
import { ImageButton } from '../../../components/btn/IconButton'
import { useNFT3, useNFT3Profile, useYlide } from '../../../domains/data'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import imageAttachmentSvg from '../../../public/image-attachment.svg'
import { useDebounceMemo } from '../../../app/hooks/useDebounceMemo'
import { toast } from '../../../lib/toastify'
import type { IMessage, Uint256 } from '@ylide/sdk'
import { MessageContentV4, YMF } from '@ylide/sdk'
import { constructFeedId } from '@ylide/ethereum'
import { indexerRequest } from '../../../domains/data/ylide/utils/net'

interface PostData {
  title?: string
  content?: string
  image?: string
  date: number
}

const defaultPosts: PostData[] = [
  {
    title: 'Hello World',
    content:
      'Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.<br/><br/>Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.<br/><br/>Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.<br/><br/>Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',
    image: 'https://picsum.photos/seed/1/1200/800',
    date: Date.now(),
  },
  {
    title: "What's going on?",
    content:
      'Lorem ipsum dolor sit amet consectetur.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',

    image: 'https://picsum.photos/seed/9/1200/800',
    date: Date.now(),
  },
  {
    title: 'Small amount of content',
    content:
      'Lorem ipsum dolor sit amet consectetur.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',

    date: Date.now(),
  },
  {
    content:
      'Post with no title! Lorem ipsum dolor sit amet consectetur.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',
    date: Date.now(),
  },
  {
    content:
      'Post with no title, but with an image! Lorem ipsum dolor sit amet consectetur.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',
    image: 'https://picsum.photos/seed/e/1200/800',
    date: Date.now(),
  },
  {
    image: 'https://picsum.photos/seed/f/1200/800',
    date: Date.now(),
  },
  {
    title: 'Just a casual post with no content',
    image: 'https://picsum.photos/seed/d/1200/800',
    date: Date.now(),
  },
  {
    title: 'Nothing Special',
    content:
      'Lorem ipsum dolor sit amet consectetur.<br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.<br/><br/>Id eget fermentum consectetur praesent ante vel. Lorem ipsum dolor sit amet consectetur. Id eget fermentum consectetur praesent ante vel.',

    date: Date.now(),
  },
]

const uniqueFeedId = '0000000000000000000000000000000000000000000000000000000000000117' as Uint256 // ISME const

export function useFeedLoader(userAddress: string) {
  const feedId = constructFeedId(userAddress, true, uniqueFeedId)
  const { walletAccount, decodeMessage } = useYlide()

  return useCallback(
    async (offset: number, limit: number) => {
      const data = await indexerRequest<IMessage[]>(`/broadcasts/`, {
        feedId,
        offset,
        limit,
      })

      const messages = await Promise.all(data.map((entry) => decodeMessage(entry.msgId, entry, walletAccount!)))

      return data.map((d, idx) => ({
        body: messages[idx]!,
        msg: d,
      }))
    },
    [decodeMessage, feedId, walletAccount]
  )
}

//

const FEED_ITEM_CONTENT_MAX_HEIGHT = 120

enum FeedItemFoldState {
  UNKNOWN,
  COLLAPSED,
  EXPANDED,
}

type FeedItemProps = { expanded?: boolean; post: PostData }

const FeedItem: FC<FeedItemProps> = ({ expanded, post }) => {
  const { profile } = useNFT3Profile()
  const { format } = useNFT3()

  const contentRef = useRef<HTMLElement>()
  const [foldState, setFoldState] = useState(expanded ? FeedItemFoldState.EXPANDED : FeedItemFoldState.UNKNOWN)

  useEffect(() => {
    if (foldState !== FeedItemFoldState.UNKNOWN) return

    // Feed item is not visible at the beginning, since it's insida a inactive Tab.
    // So we need to check its visibility periodically.
    const timer = setInterval(() => {
      const scrollHeight = contentRef.current?.scrollHeight || 0
      if (scrollHeight || post.image) {
        const isContentGreater = scrollHeight > FEED_ITEM_CONTENT_MAX_HEIGHT

        // We treat the post as collapsed if any image is present,
        // since 99.99% that this image is cropped and not visible entirely
        setFoldState(isContentGreater || post.image ? FeedItemFoldState.COLLAPSED : FeedItemFoldState.EXPANDED)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [foldState, post.image])

  return (
    <Card>
      {!!post.image && (
        <CardMedia
          component="img"
          image={post.image}
          sx={{ height: foldState === FeedItemFoldState.EXPANDED ? undefined : 160 }}
        />
      )}

      <CardContent sx={{ padding: 3 }}>
        {!!post.title && <H2 marginBottom={2}>{post.title}</H2>}

        {!!post.content && (
          <Box
            ref={contentRef}
            sx={{
              marginBottom: 3,
              color: 'text.secondary',
              maxHeight: foldState === FeedItemFoldState.EXPANDED ? undefined : FEED_ITEM_CONTENT_MAX_HEIGHT,
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5}>
            <Avatar alt={profile.name} src={format(profile.avatar)} sx={{ width: 40, height: 40 }} />

            <Stack>
              <Span fontWeight={600}>{profile.name}.isme</Span>
              <Tiny>{formatDate(post.date, 'MMM d, yyyy')}</Tiny>
            </Stack>
          </Stack>

          {foldState === FeedItemFoldState.COLLAPSED && (
            <ImageButton
              src={expandSvg}
              title="Expand"
              sx={{ marginX: 1 }}
              onClick={() => setFoldState(FeedItemFoldState.EXPANDED)}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

//

const Form = styled(Box)`
  ${({ theme }) => ({
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    borderBottom: `1px solid ${theme.palette.divider}`,
  })}
`

const NewPostForm: FC<{ onPost: () => void }> = ({ onPost }) => {
  const [isTitleVisible, setTitleVisible] = useState(false)
  const { broadcastMessage } = useYlide()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageData, setImageData] = useState('')

  const fileInput = useMemo(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files![0]
      if (file) {
        const image = document.createElement('img')
        const reader = new FileReader()

        const onerror = () => {
          toast.error("Couldn't load the image")
        }

        reader.onloadend = () => {
          image.src = reader.result!.toString()
        }

        image.onload = () => {
          setImageData(image.src)
        }

        reader.onerror = onerror
        image.onerror = onerror

        reader.readAsDataURL(file)
      }
    }
    return input
  }, [])

  const preview = useDebounceMemo<PostData | undefined>(
    () => {
      const postData: PostData = {
        title: title.trim(),
        content: content.trim(),
        image: imageData,
        date: Date.now(),
      }

      if (postData.title || postData.content || postData.image) {
        return postData
      }
    },
    [title, content, imageData],
    1000
  )

  const handlePost = useCallback(async () => {
    const msgContent = new MessageContentV4({
      sendingAgentName: 'isme-feed',
      sendingAgentVersion: { major: 1, minor: 0, patch: 0 },
      subject: title,
      content: YMF.fromPlainText(content),
      attachments: [], // TODO?
      extraBytes: new Uint8Array(0),
      extraJson: {},
    })

    const result = await broadcastMessage({ content: msgContent })
    if (result.pushes.length) {
      onPost()
      setTitle('')
      setContent('')
      setImageData('')
    }
  }, [title, content, broadcastMessage, onPost])

  return (
    <Form>
      <Card sx={{ padding: 2 }}>
        <Stack direction="row" alignItems={isTitleVisible ? 'end' : 'center'} spacing={2}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              placeholder={isTitleVisible ? 'Title' : 'Make a new post'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setTitleVisible(true)}
            />

            {isTitleVisible && (
              <TextField
                multiline
                variant="outlined"
                minRows={3}
                maxRows={20}
                placeholder="Description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <ImageButton
              src={imageAttachmentSvg}
              title="Attach Cover Image"
              onClick={() => {
                setTitleVisible(true)
                fileInput.click()
              }}
            />

            <Button
              variant="gradient"
              size="large"
              sx={{ flexShrink: 0 }}
              onClick={() => {
                handlePost()
              }}
            >
              Post
            </Button>
          </Stack>
        </Stack>
      </Card>

      {preview && (
        <Stack paddingTop={4} spacing={2}>
          <H2>Preview</H2>

          <FeedItem expanded post={preview} />
        </Stack>
      )}
    </Form>
  )
}

//

const Feed: FC = () => {
  const { isUser, didinfo } = useNFT3Profile()
  const address = didinfo?.addresses[0]?.split(':')[1] || ''
  const [posts, setPosts] = useState<PostData[]>([])
  const feedLoader = useFeedLoader(address)

  const loadPosts = useCallback(
    async (offset = 0, limit = 10) => {
      const newPosts = await feedLoader(offset, limit)
      setPosts(
        newPosts.map(({ body, msg }) => ({
          title: body.decodedSubject,
          content: typeof body.decodedTextData === 'string' ? body.decodedTextData : body.decodedTextData.toPlainText(),
          image: '',
          date: msg.createdAt * 1000,
        }))
      )
    },
    [feedLoader]
  )

  useEffect(() => {
    ;(async () => {
      if (address) {
        loadPosts()
      } else {
        setPosts([])
      }
    })()
  }, [address, loadPosts])

  const hasMoreData = true
  const isLoading = false

  return (
    <Stack spacing={2}>
      {isUser && <NewPostForm onPost={loadPosts} />}

      {posts.length ? (
        <>
          {posts.map((post, i) => (
            <FeedItem key={i} post={post} />
          ))}

          <Box justifyContent="center" display="flex">
            {hasMoreData ? (
              <Button size="small" disabled={isLoading}>
                Load More
              </Button>
            ) : (
              <Button size="small" disabled>
                No more data
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <Typography color="text.disabled">No posts yet.</Typography>
        </Box>
      )}
    </Stack>
  )
}

export default Feed
