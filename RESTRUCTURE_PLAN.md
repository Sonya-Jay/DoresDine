# Monorepo Restructuring Plan

## Target Structure
```
doresdine/ (project root)
├── frontend/          # React Native/Expo app
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── services/
│   ├── package.json
│   └── ...
├── backend/           # Backend API
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

## Steps to Execute

1. Move all current files to `frontend/` folder
2. Copy backend folder to `backend/`
3. Create root-level README
4. Update .gitignore for monorepo
5. Test that frontend still works from new location

