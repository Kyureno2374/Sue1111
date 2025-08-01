import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/supabase-server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Проверяем, существует ли пользователь
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking for existing user:", fetchError)
      return NextResponse.json({ error: "Database error while checking user." }, { status: 500 })
    }

    if (existingUser) {
      // Пользователь существует, попытка входа.
      const isValid = await bcrypt.compare(password, existingUser.password)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
      // Обновляем время последнего входа
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", existingUser.id)

      return NextResponse.json({
        id: existingUser.id,
        username: existingUser.username,
        balance: existingUser.balance,
        avatar: existingUser.avatar,
        gamesPlayed: existingUser.games_played,
        gamesWon: existingUser.games_won,
        walletAddress: existingUser.wallet_address,
        isAdmin: existingUser.is_admin,
        status: existingUser.status,
      })
    } else {
      // Пользователь не существует, попытка регистрации.
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Создаем пользователя напрямую через Supabase
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{
          username,
          password: hashedPassword,
          balance: 0,
          avatar: null,
          games_played: 0,
          games_won: 0,
          is_admin: false,
          status: "active",
        }])
        .select()
        .single()

      if (createError || !newUser) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      return NextResponse.json({
        id: newUser.id,
        username: newUser.username,
        balance: newUser.balance,
        avatar: newUser.avatar,
        gamesPlayed: newUser.games_played,
        gamesWon: newUser.games_won,
        walletAddress: newUser.wallet_address,
        isAdmin: newUser.is_admin,
        status: newUser.status,
      })
    }
  } catch (error) {
    console.error("Error in auth route:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session" }, { status: 401 })
    }

    const supabase = getSupabaseServerClient()
    
    // Проверяем сессию (в реальном приложении нужно проверять токен)
    // Здесь упрощенная проверка - в реальности нужна JWT валидация
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionToken)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
      avatar: user.avatar,
      gamesPlayed: user.games_played,
      gamesWon: user.games_won,
      walletAddress: user.wallet_address,
      isAdmin: user.is_admin,
      status: user.status,
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies()
    const response = NextResponse.json({ success: true })
    
    // Удаляем сессионную куку
    response.cookies.delete("session_token")
    
    return response
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
