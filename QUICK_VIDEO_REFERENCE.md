# 🎥 Quick Video Recording Reference Card

**Print this out and keep it near you while recording!**

---

## 📊 Video Structure (5-10 minutes)

| Section | Time | Actions |
|---------|------|---------|
| **Intro** | 0:30 | Say name, project title, brief overview |
| **Setup** | 1:00 | Show docker-compose up, services starting |
| **Login** | 0:30 | Login as tenant admin |
| **Dashboard** | 1:00 | Show dashboard stats and recent projects |
| **Projects** | 1:30 | Create project, edit, show multi-tenancy |
| **Tasks** | 1:30 | Create task, assign, update status |
| **Multi-Tenancy** | 1:00 | Switch tenants, verify data isolation |
| **Authorization** | 0:30 | Show role-based access control |
| **Code** | 1:30 | Show 3 files: schema, auth middleware, API |
| **Conclusion** | 0:30 | Thank viewers, mention GitHub |
| **Total** | ~9:00 | Complete walkthrough |

---

## 🔑 Test Credentials (Keep Handy)

```
DEMO TENANT:
- Subdomain: demo
- Admin Email: admin@demo.com
- Admin Password: Demo@123

REGULAR USER:
- Email: user1@demo.com
- Password: User@123

SUPER ADMIN:
- Email: superadmin@system.com
- Password: Admin@123
```

---

## 🖥️ Terminal Commands (Copy-Paste Ready)

```bash
# Start Docker
docker-compose up -d

# Check health
curl http://localhost:5000/api/health

# View services
docker-compose ps

# Stop (when done)
docker-compose down
```

---

## 🌐 URLs to Open

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:5000/api/health
- **GitHub Repo**: [Your repo link]

---

## 📁 Files to Show in Code Walkthrough

1. **Database Schema**: `backend/prisma/schema.prisma`
2. **Auth Middleware**: `backend/src/middleware/auth.js`
3. **RBAC Middleware**: `backend/src/middleware/rbac.js`
4. **Projects Controller**: `backend/src/controllers/projects.controller.js`
5. **Docker Compose**: `docker-compose.yml`

---

## 🎤 Speaking Tips

- **Speak slowly** - Give viewers time to follow
- **Point at screen** - Use cursor to highlight areas
- **Pause between sections** - Brief 2-3 second pauses
- **Be enthusiastic** - This is cool stuff!
- **Skip mistakes** - It's okay to restart a section
- **No editing needed** - Single take is fine

---

## ✅ Pre-Recording Checklist

- [ ] Microphone tested and working
- [ ] Screen recorder open and ready
- [ ] Docker services NOT running yet (start during recording)
- [ ] Code editor open (VS Code)
- [ ] Browser open but no tabs loaded
- [ ] All URLs written down or bookmarked
- [ ] Test credentials visible (on paper or notepad)
- [ ] Sufficient disk space (1-2GB)
- [ ] Do not disturb mode ON
- [ ] Backup browser window open (for switching)

---

## 🎬 Recording Software Options

### Mac Built-in (Best for Mac users)
1. Command + Shift + 5
2. Click "Record Entire Screen"
3. Click "Start Recording" button
4. Select where to save

### OBS Studio (Free, Cross-platform)
1. Download from obsproject.com
2. Add Display Capture source
3. Add Audio Input Capture
4. Click Start Recording
5. Save as MP4

### QuickTime (Built-in Mac)
1. Open QuickTime Player
2. File → New Screen Recording
3. Click Record button
4. Select area to record

---

## 📹 After Recording

1. **Review video**: Watch first 30 seconds to check quality
2. **Trim if needed**: Remove beginning/end dead space
3. **Upload to YouTube**:
   - youtube.com → Create → Upload video
   - Title: "Workspace Hub - Multi-Tenant SaaS Demo"
   - Set to "Unlisted"
   - Add description with GitHub link
   - Copy YouTube URL
4. **Update README**: Paste URL into demo section
5. **Keep the file**: Backup your recording locally

---

## 🚨 If Something Goes Wrong

- **Audio too quiet**: Re-record with mic closer to face
- **Screen too fast**: Slow down your clicking and typing
- **Forgot something**: Just record a second video or redo that section
- **Service failed**: Restart docker and continue
- **Mistakes in speech**: Just pause and re-record that section
- **Bad quality**: Check screen resolution settings (1920x1080 ideal)

---

## ⏱️ Timing Tips

- **Don't rush**: 9 minutes is plenty of time
- **Pause naturally**: 2-3 seconds between sections
- **Show, don't tell**: Let the screen speak
- **Read from notes**: It's okay to read your script
- **Test clicking speed**: Make movements visible on screen

---

## 🎯 Key Things to Demonstrate

1. ✅ Docker starts all 3 services
2. ✅ Frontend accessible at :3000
3. ✅ Health check returns "connected"
4. ✅ Can register new tenant
5. ✅ Can login as different users
6. ✅ Create project/task works
7. ✅ Switch tenants shows different data
8. ✅ Unauthorized access returns 403
9. ✅ Code is well-structured
10. ✅ All 6 frontend pages work

---

**Good luck! You've got this! 🚀**

**Recording Time Goal**: 5-10 minutes  
**Editing Time**: 0 (no editing required!)  
**Upload Time**: 5-10 minutes  
**Total Time**: ~1-2 hours maximum

---

*Save this file as a bookmark or print it out!*
