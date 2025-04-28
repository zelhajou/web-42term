# 42term - Terminal-Style Widgets for 42 School Students

<img width="1560" alt="Screen Shot 2025-04-28 at 11 45 20 AM" src="https://github.com/user-attachments/assets/0dd47cff-83a9-4519-b786-4f473c24d873" />

## Overview

42term is a web application that generates beautiful terminal-style widgets to showcase 42 school students' profiles, projects, and skills. These widgets can be embedded in GitHub READMEs, personal websites, or anywhere that supports SVG images.

## Features

- **Multiple Widget Types**:
  - **Profile Widget**: Display student information, level, and statistics
  - **Projects Widget**: Showcase completed projects with marks
  - **Skills Widget**: Visualize coding skills and proficiency levels

- **Customization**:
  - Dark and Light themes
  - Adjustable width
  - Downloadable SVG files

- **Easy Integration**:
  - Direct URL embedding
  - Markdown for GitHub READMEs
  - HTML for websites

## Getting Started

### Visit the Live App

The easiest way to generate your widget is to visit [42term](https://42term.vercel.app) and follow these steps:

1. Enter your 42 intra username
2. Select the widget type (Profile, Projects, Skills)
3. Choose your preferred theme
4. Copy the generated markdown or HTML code

### Embedding in GitHub README

Add this to your GitHub README to display your widget:

```markdown
![username's 42 profile](https://42term.vercel.app/api/widget/student/username?theme=dark)
```

Replace `username` with your 42 intra username, and choose the widget type:
- `student` for profile widget
- `projects` for projects widget
- `skills` for skills widget

### Examples

#### Profile Widget

```markdown
![zelhajou's 42 profile](https://42term.vercel.app/api/widget/student/zelhajou?theme=dark)
```
<div align="center">
  
![zelhajou's 42 profile](https://42term.vercel.app/api/widget/student/zelhajou?theme=dark)

</div>

#### Projects Widget

```markdown
![zelhajou's 42 projects](https://42term.vercel.app/api/widget/projects/zelhajou?theme=dark)
```

<div align="center">
  
![zelhajou's 42 projects](https://42term.vercel.app/api/widget/projects/zelhajou?theme=dark)

</div>

#### Skills Widget

```markdown
![zelhajou's 42 skills](https://42term.vercel.app/api/widget/skills/zelhajou?theme=dark)
```

<div align="center">
  
![zelhajou's 42 skills](https://42term.vercel.app/api/widget/skills/zelhajou?theme=dark)

</div>


## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/widget/:type/:username` | Generate SVG widget (type: student, projects, skills) |
| `/api/student/:username` | Get raw student data |
| `/api/github-badge/:username` | Simple GitHub-compatible level badge |
| `/api/download-widget/:type/:username` | Downloadable SVG file |

### Query Parameters

- `theme`: `dark` or `light` (default: dark)
- `width`: Width in pixels (default: 800)
- `maxSkills`: Maximum skills to display for skills widget
- `maxProjects`: Maximum projects to display for projects widget
- `includePiscine`: Include Piscine projects (true/false)

## Running Locally

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zelhajou/42term.git
cd 42term
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Create a `.env` file with your 42 API credentials:
```
NEXT_PUBLIC_42_API_URL="https://api.intra.42.fr/v2"
FT_CLIENT_SECRET="your-client-secret"
FT_CLIENT_ID="your-client-id"
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technologies Used

- **Next.js 15** - React framework
- **TailwindCSS** - Styling
- **42 API** - Data source
- **SVG** - Widget rendering

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to help improve 42term.

## License

This project is open source and available under the MIT License.

## Acknowledgements

Created with ❤️ by Zelhajou, a 1337 (42 Network) student. Not officially affiliated with 42 School.
