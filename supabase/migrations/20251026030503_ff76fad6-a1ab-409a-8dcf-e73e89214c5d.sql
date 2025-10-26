-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_hours INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed categories
INSERT INTO public.categories (name, description, icon, color) VALUES
  ('Web Development', 'Learn to build modern websites and web applications', 'Code', 'hsl(250, 80%, 60%)'),
  ('Cybersecurity', 'Master the art of protecting digital systems and data', 'Shield', 'hsl(15, 85%, 60%)'),
  ('Languages', 'Speak new languages through practical conversation', 'Languages', 'hsl(150, 70%, 50%)');

-- Seed courses for Web Development
INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Intro to Web Development',
  'Learn HTML, CSS, and how websites work from the ground up.',
  'Beginner',
  8
FROM public.categories WHERE name = 'Web Development';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Learn React by Building a To-Do App',
  'Master React fundamentals by building a real project with components and state.',
  'Intermediate',
  12
FROM public.categories WHERE name = 'Web Development';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Master Tailwind CSS through Projects',
  'Style beautiful layouts and components using utility-first CSS.',
  'Intermediate',
  10
FROM public.categories WHERE name = 'Web Development';

-- Seed courses for Cybersecurity
INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Basics of Cyber Hygiene',
  'Learn to create secure passwords, spot phishing, and protect your privacy.',
  'Beginner',
  6
FROM public.categories WHERE name = 'Cybersecurity';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Intro to Ethical Hacking',
  'Understand penetration testing concepts and security vulnerabilities.',
  'Advanced',
  15
FROM public.categories WHERE name = 'Cybersecurity';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Network Security for Beginners',
  'Master firewalls, IP addresses, and basic packet analysis.',
  'Intermediate',
  12
FROM public.categories WHERE name = 'Cybersecurity';

-- Seed courses for Languages
INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Learn Spanish by Speaking',
  'Practice common phrases and conversations in real-world contexts.',
  'Beginner',
  20
FROM public.categories WHERE name = 'Languages';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'English Practice for Everyday Use',
  'Improve your conversational English with practical daily scenarios.',
  'Beginner',
  18
FROM public.categories WHERE name = 'Languages';

INSERT INTO public.courses (category_id, title, description, difficulty, estimated_hours)
SELECT 
  id,
  'Intro to Japanese with Real Phrases',
  'Learn practical Japanese expressions and cultural context.',
  'Beginner',
  25
FROM public.categories WHERE name = 'Languages';

-- Seed lessons for Intro to Web Development
INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'What is a Website?',
  'Understand the fundamental building blocks of the web.',
  'Create a simple HTML file that displays "Hello World" and describes what HTML, CSS, and JavaScript do.',
  1
FROM public.courses WHERE title = 'Intro to Web Development';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'HTML Basics',
  'Learn about HTML tags, elements, and document structure.',
  'Build a personal profile page with headings, paragraphs, links, and an image.',
  2
FROM public.courses WHERE title = 'Intro to Web Development';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Styling with CSS',
  'Add colors, fonts, and layouts to your HTML pages.',
  'Style your profile page with custom colors, fonts, and a centered layout.',
  3
FROM public.courses WHERE title = 'Intro to Web Development';

-- Seed lessons for Learn React by Building a To-Do App
INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'React Components Basics',
  'Understand components, JSX, and the component lifecycle.',
  'Create a simple React component that displays a list of tasks.',
  1
FROM public.courses WHERE title = 'Learn React by Building a To-Do App';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'State and Props',
  'Learn how to manage data in React applications.',
  'Add state to your to-do app and create an input field to add new tasks.',
  2
FROM public.courses WHERE title = 'Learn React by Building a To-Do App';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Event Handling',
  'Handle user interactions like clicks and form submissions.',
  'Implement the ability to mark tasks as complete and delete tasks.',
  3
FROM public.courses WHERE title = 'Learn React by Building a To-Do App';

-- Seed lessons for Master Tailwind CSS
INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Tailwind Fundamentals',
  'Learn utility-first CSS and Tailwind''s class naming system.',
  'Create a responsive card component using only Tailwind utility classes.',
  1
FROM public.courses WHERE title = 'Master Tailwind CSS through Projects';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Responsive Design',
  'Build layouts that work on mobile, tablet, and desktop.',
  'Create a responsive navigation bar that collapses on mobile devices.',
  2
FROM public.courses WHERE title = 'Master Tailwind CSS through Projects';

-- Seed lessons for Basics of Cyber Hygiene
INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Password Security',
  'Learn to create and manage strong, unique passwords.',
  'Create 5 strong passwords using a password manager and explain why they''re secure.',
  1
FROM public.courses WHERE title = 'Basics of Cyber Hygiene';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Spotting Phishing Attacks',
  'Recognize common phishing tactics and protect yourself.',
  'Analyze 5 example emails and identify which ones are phishing attempts and why.',
  2
FROM public.courses WHERE title = 'Basics of Cyber Hygiene';

-- Seed lessons for Learn Spanish by Speaking
INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Greetings and Introductions',
  'Master basic Spanish greetings and how to introduce yourself.',
  'Record yourself introducing yourself in Spanish: name, where you''re from, and what you do.',
  1
FROM public.courses WHERE title = 'Learn Spanish by Speaking';

INSERT INTO public.lessons (course_id, title, description, task_description, order_index)
SELECT 
  id,
  'Ordering Food',
  'Learn essential phrases for restaurants and cafes.',
  'Practice ordering a meal in Spanish, including asking for recommendations and the bill.',
  2
FROM public.courses WHERE title = 'Learn Spanish by Speaking';

-- Create trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();