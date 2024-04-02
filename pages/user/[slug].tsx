import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
interface User {
  id: string;
  // Add other properties of the user object here
}
export default function Page() {
  const router = useRouter()
  const uuid = router.query.slug
  const [userData, setUserData] = useState<User[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/uuidatafetcher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuid }),
        })
        const data = await response.json()

        if (response.ok) {
          setUserData(data)
          setError(null)
        } else {
          setUserData(null)
          setError(data.message)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (uuid) {
      fetchUserData()
    }
  }, [uuid])

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!userData || userData.length === 0) {
    return <p>404 User Not Found</p>
  }

  return (
    <div>
      {userData.map((user) => (
        <p key={user.id}>Post: {user.id}</p>
      ))}
    </div>
  )
}