import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Background from "../components/background/Background";
import Heatmap from "../components/Heatmap/Heatmap";
import forgeLogo from "../assets/forge.png";

import "./profile.css";

const EMPTY_PROFILE = {
  username: "",
  display_name: "",
  bio: "",
  role_title: "",
  profile_image_url: "",
  location: "",
  timezone: "",
  website: "",
  verified: true,
  skills: [],
};

const EMPTY_SOCIALS = {
  github: "",
  linkedin: "",
  portfolio: "",
  twitter: "",
  youtube: "",
};

const EMPTY_STATS = {
  metrics: [],
  comparison: [],
  streak: 0,
  xp: {
    score: 0,
    level: 1,
    progress: 0,
    level_threshold: 0,
    next_level_at: 0,
    watch_time_hours: 0,
  },
  panels: {
    recently_watched: [],
    recent_notes: [],
  },
};

const SOCIAL_LABELS = {
  github: "GitHub",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  twitter: "Twitter/X",
  youtube: "YouTube",
};

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function EmptyState({ label }) {
  return <p className="profile-empty-state">{label}</p>;
}

function ProfileSkeleton() {
  return (
    <div className="profile-minimal-shell">
      <section className="profile-card profile-skeleton main-skeleton" />
      <section className="profile-card profile-skeleton side-skeleton" />
      <section className="profile-card profile-skeleton wide-skeleton" />
    </div>
  );
}

export default function Profile({ user, setuser, setGlobalProfileImage }) {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  
  const targetUser = urlUsername || user;
  const isOwnProfile = !urlUsername || urlUsername === user;

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [socials, setSocials] = useState(EMPTY_SOCIALS);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    role_title: "",
    profile_image_url: "",
    location: "",
    timezone: "",
    website: "",
    skills: [],
  });
  const [formSocials, setFormSocials] = useState(EMPTY_SOCIALS);
  const [skillInput, setSkillInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!targetUser) {
      navigate("/login");
    }
  }, [navigate, targetUser]);

  useEffect(() => {
    if (!targetUser) return undefined;

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const [profileResponse, statsResponse] = await Promise.all([
          fetch(`http://localhost:5000/profile/${encodeURIComponent(targetUser)}`),
          fetch(`http://localhost:5000/profile/stats/${encodeURIComponent(targetUser)}`),
        ]);

        const profilePayload = await profileResponse.json();
        const statsPayload = await statsResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profilePayload.error || "Failed to load profile");
        }

        if (!statsResponse.ok) {
          throw new Error(statsPayload.error || "Failed to load profile stats");
        }

        if (cancelled) return;

        const loadedProfile = profilePayload.profile || EMPTY_PROFILE;
        const loadedSocials = profilePayload.socials || EMPTY_SOCIALS;

        setProfile(loadedProfile);
        setSocials(loadedSocials);
        setStats(statsPayload || EMPTY_STATS);

        if (isOwnProfile) {
          setForm({
            display_name: loadedProfile.display_name || user,
            bio: loadedProfile.bio || "",
            role_title: loadedProfile.role_title || "",
            profile_image_url: loadedProfile.profile_image_url || "",
            location: loadedProfile.location || "",
            timezone: loadedProfile.timezone || "",
            website: loadedProfile.website || "",
            skills: loadedProfile.skills || [],
          });
          setFormSocials(loadedSocials);

          if (loadedProfile.profile_image_url) {
            setGlobalProfileImage?.(loadedProfile.profile_image_url);
          } else {
            setGlobalProfileImage?.(forgeLogo);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Could not load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [targetUser, user, isOwnProfile]);

  const socialEntries = useMemo(
    () =>
      Object.entries(socials)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          key,
          label: SOCIAL_LABELS[key],
          value,
        })),
    [socials]
  );

  const recentVideos = stats.panels?.recently_watched || [];
  const recentNotes = stats.panels?.recent_notes || [];
  const levelThreshold = stats.xp?.level_threshold || 0;
  const xpPercent = levelThreshold > 0 ? Math.min(100, ((stats.xp?.progress || 0) / levelThreshold) * 100) : 0;


  const handleProfileInput = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSocialInput = (event) => {
    const { name, value } = event.target;
    setFormSocials((current) => ({ ...current, [name]: value }));
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;

    setForm((current) => {
      if (current.skills.includes(nextSkill)) return current;
      return { ...current, skills: [...current.skills, nextSkill] };
    });
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.filter((item) => item !== skill),
    }));
  };

  const handleActivityClick = (videoId) => {
    if (!videoId) return;
    navigate(`/home?video=${encodeURIComponent(videoId)}`);
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const profileResponse = await fetch("http://localhost:5000/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          display_name: form.display_name,
          bio: form.bio,
          role_title: form.role_title,
          profile_image_url: form.profile_image_url,
          location: form.location,
          timezone: form.timezone,
          website: form.website,
          skills: form.skills,
        }),
      });

      const profilePayload = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profilePayload.error || "Failed to save profile");
      }

      const effectiveUsername = profilePayload.username || form.display_name || user;

      const socialsResponse = await fetch("http://localhost:5000/profile/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: effectiveUsername,
          socials: formSocials,
        }),
      });

      const socialsPayload = await socialsResponse.json();

      if (!socialsResponse.ok) {
        throw new Error(socialsPayload.error || "Failed to save social links");
      }

      setProfile((current) => ({
        ...current,
        username: effectiveUsername,
        display_name: form.display_name,
        bio: form.bio,
        role_title: form.role_title,
        profile_image_url: form.profile_image_url,
        location: form.location,
        timezone: form.timezone,
        website: form.website,
        skills: form.skills,
      }));
      setSocials(formSocials);
      setIsEditing(false);
      setMessage("Profile updated.");

      if (effectiveUsername !== user) {
        setuser?.(effectiveUsername);
      }
    } catch (saveError) {
      setError(saveError.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setuser?.("");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <>
      <Background />
      <main className="profile-minimal-page">
        <button
          type="button"
          className="profile-back-logo"
          onClick={() => navigate("/home")}
          aria-label="Go to home"
        >
          <img src={forgeLogo} alt="EduForge" />
        </button>

        <header className="profile-topbar">
          <div>
            <p>{isOwnProfile ? "My Profile" : "Public Profile"}</p>
            <h1>{profile.display_name || targetUser}</h1>
          </div>
          <div className="profile-topbar-actions">
            <button type="button" className="profile-secondary-button" onClick={() => navigate("/home")}>
              <span>←</span> Back
            </button>
            {isOwnProfile && (
              <button type="button" className="profile-primary-button" onClick={() => setIsEditing((value) => !value)}>
                <span>{isEditing ? "👁" : "✎"}</span> {isEditing ? "View profile" : "Edit profile"}
              </button>
            )}
            {isOwnProfile && (
              <button type="button" className="profile-danger-button" onClick={handleLogout}>
                <span>⎋</span> Logout
              </button>
            )}
          </div>
        </header>

        {error && <div className="profile-alert profile-alert-error">{error}</div>}
        {message && <div className="profile-alert profile-alert-success">{message}</div>}

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="profile-minimal-shell">
            <section className="profile-card profile-identity-card">
              <div className="profile-identity-row">
                <img
                  src={profile.profile_image_url || forgeLogo}
                  alt={profile.display_name || user}
                  className="profile-avatar"
                />
                <div>
                  <div className="profile-name-row">
                    <h2>{profile.display_name || user}</h2>
                    {profile.verified && <span>Verified</span>}
                  </div>
                  <p>{profile.role_title || "Learner"}</p>
                </div>
              </div>

              <p className="profile-bio-text">
                {profile.bio || "No bio added yet."}
              </p>

              <dl className="profile-detail-list">
                <div>
                  <dt>Username</dt>
                  <dd>{profile.username || user}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{profile.location || "Not set"}</dd>
                </div>
                <div>
                  <dt>Timezone</dt>
                  <dd>{profile.timezone || "Not set"}</dd>
                </div>
                <div>
                  <dt>Website</dt>
                  <dd>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer">
                        {profile.website}
                      </a>
                    ) : (
                      "Not set"
                    )}
                  </dd>
                </div>
              </dl>

              <div className="profile-skill-list">
                {(profile.skills || []).length > 0 ? (
                  profile.skills.map((skill) => <span key={skill}>{skill}</span>)
                ) : (
                  <EmptyState label="No skills added yet." />
                )}
              </div>
            </section>

            {isOwnProfile && isEditing && (
              <section className="profile-card profile-edit-card">
                <div className="profile-section-heading">
                  <h2>Edit details</h2>
                  <p>Update what appears on your profile.</p>
                </div>

                <div className="profile-form-grid">
                  <label>
                    Username
                    <input name="display_name" value={form.display_name} onChange={handleProfileInput} />
                  </label>
                  <label>
                    Role
                    <input name="role_title" value={form.role_title} onChange={handleProfileInput} />
                  </label>
                  <label>
                    Profile image URL
                    <input name="profile_image_url" value={form.profile_image_url} onChange={handleProfileInput} />
                  </label>
                  <label>
                    Website
                    <input name="website" value={form.website} onChange={handleProfileInput} />
                  </label>
                  <label>
                    Location
                    <input name="location" value={form.location} onChange={handleProfileInput} />
                  </label>
                  <label>
                    Timezone
                    <input name="timezone" value={form.timezone} onChange={handleProfileInput} />
                  </label>
                  <label className="profile-form-wide">
                    Bio
                    <textarea name="bio" value={form.bio} onChange={handleProfileInput} rows="4" />
                  </label>
                </div>

                <div className="profile-edit-block">
                  <label htmlFor="profile-skill-input">Skills</label>
                  <div className="profile-skill-editor">
                    <input
                      id="profile-skill-input"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <button type="button" onClick={addSkill}>Add</button>
                  </div>
                  <div className="profile-edit-skills">
                    {form.skills.map((skill) => (
                      <button key={skill} type="button" onClick={() => removeSkill(skill)}>
                        {skill} x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-edit-block">
                  <p className="profile-edit-label">Social links</p>
                  <div className="profile-form-grid">
                    {Object.keys(EMPTY_SOCIALS).map((key) => (
                      <label key={key}>
                        {SOCIAL_LABELS[key]}
                        <input
                          name={key}
                          value={formSocials[key] || ""}
                          onChange={handleSocialInput}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button type="button" className="profile-secondary-button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="button" className="profile-primary-button" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </section>
            )}

            <section className="profile-card profile-stats-card">
              <div className="profile-section-heading">
                <h2>Learning stats</h2>
                <p>Current progress from your watch time, streak, and notes.</p>
              </div>

              <div className="profile-stat-grid">
                <div>
                  <span>XP</span>
                  <strong>{stats.xp?.score || 1}</strong>
                  <small>Level {stats.xp?.level || 1}</small>
                </div>
                <div>
                  <span>Streak</span>
                  <strong>{stats.streak || 0}</strong>
                  <small>days</small>
                </div>
                <div>
                  <span>Watch time</span>
                  <strong>{formatTime(stats.xp?.watch_time_seconds || 0)}</strong>
                  <small>H:M:S</small>
                </div>
                <div>
                  <span>Next level</span>
                  <strong>{stats.xp?.next_level_at || 0}</strong>
                  <small>XP</small>
                </div>
              </div>

              <div className="profile-progress-row">
                <div>
                  <span>Level progress</span>
                  <strong>{Math.round(xpPercent)}%</strong>
                </div>
                <div className="profile-progress-track">
                  <span style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </section>

            <section className="profile-card profile-social-card">
              <div className="profile-section-heading">
                <h2>Links</h2>
                <p>Connected profiles and personal pages.</p>
              </div>
              <div className="profile-link-list">
                {socialEntries.length > 0 ? (
                  socialEntries.map((entry) => (
                    <a key={entry.key} href={entry.value} target="_blank" rel="noreferrer">
                      <span>{entry.label}</span>
                      <small>{entry.value}</small>
                    </a>
                  ))
                ) : (
                  <EmptyState label="No links added yet." />
                )}
              </div>
            </section>

            <section className="profile-card profile-heatmap-section">
              <div className="profile-section-heading">
                <h2>Activity heatmap</h2>
                <p>Login consistency for the current year.</p>
              </div>
              <Heatmap username={profile.username || targetUser} />
            </section>

            {isOwnProfile && (
              <section className="profile-card profile-list-card">
                <div className="profile-section-heading">
                  <h2>Recently watched</h2>
                  <p>Videos logged from real watch sessions.</p>
                </div>
                <div className="profile-activity-list">
                  {recentVideos.map((item) => (
                    <article 
                      key={item.id} 
                      className={item.reference_id ? "clickable-item" : ""}
                      onClick={() => handleActivityClick(item.reference_id)}
                      style={item.reference_id ? { cursor: 'pointer' } : {}}
                    >
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.subtitle}</p>
                      </div>
                      <span>{item.status}</span>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="profile-card profile-list-card">
              <div className="profile-section-heading">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <h2>Recent notes</h2>
                    <p>Latest saved notes from your learning sessions.</p>
                  </div>
                  {isOwnProfile && (
                    <button 
                      className="profile-secondary-button" 
                      onClick={() => navigate("/notes")}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      View All
                    </button>
                  )}
                </div>
              </div>
              <div className="profile-activity-list">
                {recentNotes.map((item) => (
                  <article 
                    key={item.id}
                    className={item.reference_id ? "clickable-item" : ""}
                    onClick={() => item.reference_id && navigate(`/notes/${targetUser}/${item.reference_id}`)}
                    style={item.reference_id ? { cursor: 'pointer' } : {}}
                  >
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.subtitle}</p>
                    </div>
                    <span>{item.status}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
