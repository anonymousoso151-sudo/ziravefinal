import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setSession, fetchProfile } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';

// Import screens
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession({ session, user: session?.user ?? null }));
      if (session?.user) {
        dispatch(fetchProfile(session.user.id));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession({ session, user: session?.user ?? null }));
      if (session?.user) {
        dispatch(fetchProfile(session.user.id));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // -- وضع التطوير: تجاوز تسجيل الدخول --
  const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE_SKIP_LOGIN === 'true';

  if (DEV_MODE) {
    // إذا كنا في وضع التطوير (على جميع المنصات)
    console.warn("!!! وضع التطوير مفعل: تم تجاوز تسجيل الدخول !!!");
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  // -- انتهى وضع التطوير --

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;