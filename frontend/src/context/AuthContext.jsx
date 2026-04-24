import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../services/firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        signUp: ({ email, password, options }) => {
            return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
                if (options?.data?.full_name) {
                    return firebaseUpdateProfile(userCredential.user, {
                        displayName: options.data.full_name
                    })
                }
                return userCredential
            })
        },
        signIn: ({ email, password }) => signInWithEmailAndPassword(auth, email, password),
        signInWithGoogle: () => {
            const provider = new GoogleAuthProvider()
            return signInWithPopup(auth, provider)
        },
        signOut: () => firebaseSignOut(auth),
        updateProfile: async (updates) => {
            if (!auth.currentUser) throw new Error('No user logged in')

            const profileUpdates = {}
            if (updates.full_name) profileUpdates.displayName = updates.full_name
            if (updates.avatar_url) profileUpdates.photoURL = updates.avatar_url

            await firebaseUpdateProfile(auth.currentUser, profileUpdates)
            setUser({ ...auth.currentUser })
            return auth.currentUser
        },
        user,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
