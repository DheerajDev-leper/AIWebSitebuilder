import { useEffect, useState } from "react"
import axios from "axios"
import { serverUrl } from "../App"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

function GetCurrentUser() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const getCurrentUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/me`, {
                    withCredentials: true,
                })

                if (mounted) {
                    dispatch(setUserData(result.data))
                }
            } catch (error) {
                if (mounted) {
                    dispatch(setUserData(null))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        getCurrentUser()

        return () => {
            mounted = false
        }
    }, [dispatch])

    return loading
}

export default GetCurrentUser
