# 🐾 FurryFriends – React Native App

A Tinder-like social app that connects pet owners, non-pet owners, animal shelters, and an admin — built with **React Native** and **Expo Go**.

---

## ✨ Features

- 🔐 Multi-role login: PetOwner, NonPetOwner, Shelter, Admin
- 🐶 Swipe interface to match dogs (like Tinder)
- 💬 In-app chat opens after mutual interest
- 🗓️ Playdate reminders & rating modal (via AsyncStorage)
- 🔔 Role-based notifications
- 📍 Filter by location, breed, and preferences
- 📊 Admin dashboard for stats, banning, and user management

---

## 🪲 Notable Bugs & Fixes

| Bug | Fix |
|-----|-----|
| Reminder not showing for NonPetOwner | Adjusted role logic |
| GitHub push failed (repo too big) | Cleaned with BFG + removed large `.obj` files |
| Rating modal not showing | Fixed end-time calculation |

---

## ✅ Final State

The app is fully functional, supports all roles, handles reminders, ratings, swipes, and chats smoothly. It’s ready for presentation and future backend integration.

---

## 🧠 What I Learned

I learned to build and debug a full mobile app, manage state and AsyncStorage, clean Git history, and create a great user experience with React Native and Expo Go. I'm proud of how much I grew through this project. 💪

---

## 🚀 Run Locally

```bash
git clone https://github.com/PopAlexandra2004/FurryFriends_React.git
cd FurryFriends_React
npm install
npx expo start
