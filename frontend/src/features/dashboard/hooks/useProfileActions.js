import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/dashboardUtils";

export const useProfileActions = (profile) => {
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [savingBio, setSavingBio] = useState(false);

  const [editingLeetcode, setEditingLeetcode] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState(profile?.leetcodeUsername || "");
  const [savingLeetcode, setSavingLeetcode] = useState(false);

  const [editingCollege, setEditingCollege] = useState(false);
  const [college, setCollege] = useState(profile?.college || null);
  const [branch, setBranch] = useState(profile?.branch || "");
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || "");
  const [savingCollege, setSavingCollege] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio || "");
    setLeetcodeUsername(profile.leetcodeUsername || "");
    setCollege(profile.college || null);
    setBranch(profile.branch || "");
    setGraduationYear(profile.graduationYear || "");
  }, [profile]);

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await axios.put(`${API_BASE_URL}/api/profile/update`, { bio }, { withCredentials: true });
      setEditingBio(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBio(false);
    }
  };

  const saveLeetcodeUsername = async () => {
    setSavingLeetcode(true);
    try {
      const normalizedLeetcodeUsername = (leetcodeUsername || "").trim();
      await axios.put(
        `${API_BASE_URL}/api/profile/update`,
        { leetcodeUsername: normalizedLeetcodeUsername },
        { withCredentials: true }
      );

      setLeetcodeUsername(normalizedLeetcodeUsername);
      setEditingLeetcode(false);
      setToastMessage(
        normalizedLeetcodeUsername
          ? "LeetCode username saved. Re-analyze to refresh your score."
          : "LeetCode username removed. Re-analyze to refresh your score."
      );
    } catch (err) {
      console.error(err);
      setToastMessage("Could not save LeetCode username. Please try again.");
    } finally {
      setSavingLeetcode(false);
    }
  };

  const saveCollege = async () => {
    setSavingCollege(true);
    try {
      const payload = { branch, graduationYear };
      if (college) {
        payload.college = {
          id: college.id,
          name: college.name,
          country: college.country
        };
      }

      const res = await axios.put(`${API_BASE_URL}/api/profile/update`, payload, {
        withCredentials: true
      });

      setCollege(res.data.college || null);
      setBranch(res.data.branch || "");
      setGraduationYear(res.data.graduationYear || "");
      setEditingCollege(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCollege(false);
    }
  };

  return {
    editingBio,
    setEditingBio,
    bio,
    setBio,
    savingBio,
    saveBio,

    editingLeetcode,
    setEditingLeetcode,
    leetcodeUsername,
    setLeetcodeUsername,
    savingLeetcode,
    saveLeetcodeUsername,

    editingCollege,
    setEditingCollege,
    college,
    setCollege,
    branch,
    setBranch,
    graduationYear,
    setGraduationYear,
    savingCollege,
    saveCollege,

    toastMessage,
    setToastMessage
  };
};
